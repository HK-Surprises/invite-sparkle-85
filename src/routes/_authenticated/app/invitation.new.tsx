import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { myCustomerQuery, myTemplatesQuery } from "@/lib/queries";
import type { InvitationData, TemplateField } from "@/types";

export const Route = createFileRoute("/_authenticated/app/invitation/new")({
  validateSearch: (s: Record<string, unknown>) => ({ template: typeof s["template"] === "string" ? (s["template"] as string) : undefined }),
  head: () => ({ meta: [{ title: "Invitation details — InviteHub" }, { name: "description", content: "Enter the details for your invitation." }, { property: "og:title", content: "Invitation details — InviteHub" }, { property: "og:description", content: "Enter the details for your invitation." }] }),
  component: NewInvitationPage,
});

function NewInvitationPage() {
  const { template: templateId } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const templates = useQuery(myTemplatesQuery);
  const customer = useQuery(myCustomerQuery);
  const template = templates.data?.find((t) => t.id === templateId);
  const fields = useMemo(() => ((template?.field_schema as unknown as TemplateField[] | null) ?? []), [template]);

  const [title, setTitle] = useState("");
  const [data, setData] = useState<InvitationData>({});

  const autoTitle = useMemo(() => {
    if (data.groomName && data.brideName) return `${data.groomName} & ${data.brideName} ${template?.categories?.name ?? ""}`.trim();
    if (data.primaryName) return `${data.primaryName} — ${template?.categories?.name ?? "Celebration"}`;
    return "";
  }, [data, template]);

  const create = useMutation({
    mutationFn: async () => {
      if (!template || !customer.data) throw new Error("Missing template");
      const missing = fields.filter((f) => f.required && !data[f.key]?.trim());
      if (missing.length) throw new Error(`Please fill in: ${missing.map((m) => m.label).join(", ")}`);
      const { data: row, error } = await supabase
        .from("invitations")
        .insert({ customer_id: customer.data.id, template_id: template.id, title: (title || autoTitle).trim() || template.name, data: data as Record<string, string>, status: "active" })
        .select("id")
        .single();
      if (error) throw new Error(error.message.includes("row-level security") ? "You don't have access to this template." : error.message);
      return row;
    },
    onSuccess: (row) => {
      toast.success("Invitation created. Now add your guests.");
      qc.invalidateQueries({ queryKey: ["me"] });
      navigate({ to: "/app/invitation", search: { inv: row.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (templates.isLoading || customer.isLoading) return <PageSkeleton />;
  if (!template) {
    return (
      <EmptyState
        title="Choose a template first"
        description="Pick one of your assigned templates to start entering invitation details."
        action={
          <Button asChild>
            <Link to="/app/templates">Go to templates</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Step 2"
        title="Invitation details"
        description={`Using ${template.name}. These details appear on every guest's personalized invitation.`}
        actions={
          <Button asChild variant="ghost">
            <Link to="/app/templates">
              <ArrowLeft /> Change template
            </Link>
          </Button>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <form
          className="card-elevated space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Invitation name</Label>
            <Input id="title" placeholder={autoTitle || "e.g. Rahul & Priya Wedding"} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            <p className="text-xs text-muted-foreground">Only you see this name — it helps you find the invitation later.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <Label htmlFor={f.key}>
                  {f.label} {f.required && "*"}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea id={f.key} rows={3} maxLength={500} value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
                ) : (
                  <Input id={f.key} type={f.type === "date" ? "date" : "text"} required={f.required} maxLength={160} value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <Button type="submit" size="lg" disabled={create.isPending}>
            {create.isPending && <Loader2 className="animate-spin" />}
            Save & add guests
          </Button>
        </form>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live preview · as Amit would see it</p>
          <InvitationPreview componentKey={template.component_key} title={title || autoTitle} data={data} guestName="Amit" />
        </aside>
      </div>
    </div>
  );
}
