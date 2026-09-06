import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { CardGridSkeleton } from "@/components/shared/LoadingState";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { supabase } from "@/integrations/supabase/client";
import { adminTemplatesQuery } from "@/lib/queries";
import { sampleDataFor } from "@/templates/registry";
import { formatDate } from "@/lib/format";
import type { Template } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  head: () => ({ meta: [{ title: "Templates — InviteHub Admin" }, { name: "description", content: "Manage the template gallery." }, { property: "og:title", content: "Templates — InviteHub Admin" }, { property: "og:description", content: "Manage the template gallery." }] }),
  component: AdminTemplatesPage,
});

function AdminTemplatesPage() {
  const qc = useQueryClient();
  const templates = useQuery(adminTemplatesQuery);
  const [preview, setPreview] = useState<Template | null>(null);
  const toggle = useMutation({
    mutationFn: async (t: Template) => {
      const { error } = await supabase.from("templates").update({ is_active: !t.is_active }).eq("id", t.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { toast.success("Template updated."); qc.invalidateQueries({ queryKey: ["admin", "templates"] }); },
    onError: () => toast.error("Couldn't update template."),
  });

  return (
    <div>
      <PageHeader title="Templates" description="Designs customers can be given access to. Assign them from a customer's page." />
      {templates.isLoading ? (
        <CardGridSkeleton />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templates.data?.map((t) => (
            <TemplateCard
              key={t.id}
              name={t.name}
              categoryName={t.categories?.name}
              componentKey={t.component_key}
              description={t.description}
              isActive={t.is_active}
              meta={<span className="text-xs text-muted-foreground">{formatDate(t.created_at)}</span>}
              footer={
                <>
                  <Button size="sm" variant="outline" onClick={() => setPreview(t)}>Preview</Button>
                  <Button size="sm" variant={t.is_active ? "ghost" : "default"} onClick={() => toggle.mutate(t)}>
                    {t.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-2xl">{preview?.name}</DialogTitle>
          {preview && <InvitationPreview componentKey={preview.component_key} title={sampleDataFor(preview.component_key).title} data={sampleDataFor(preview.component_key).data} guestName="Amit" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
