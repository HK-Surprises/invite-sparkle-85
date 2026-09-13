import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ArrowLeft, KeyRound, RotateCcw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingState";
import { CustomerForm, type CustomerFormValues } from "@/features/customers/CustomerForm";
import { supabase } from "@/integrations/supabase/client";
import { resetCustomerPassword } from "@/lib/admin.functions";
import { adminCustomerQuery } from "@/lib/queries";
import { formatDate, percent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/customers/$id")({
  head: () => ({ meta: [{ title: "Customer — InviteHub Admin" }, { name: "description", content: "Customer profile, access, limits and usage." }, { property: "og:title", content: "Customer — InviteHub Admin" }, { property: "og:description", content: "Customer profile, access, limits and usage." }] }),
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const customer = useQuery(adminCustomerQuery(id));
  const resetPw = useServerFn(resetCustomerPassword);
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const [confirmArchive, setConfirmArchive] = useState(false);

  const save = useMutation({
    mutationFn: async (v: CustomerFormValues) => {
      const { error } = await supabase
        .from("customers")
        .update({ name: v.name.trim(), mobile: v.mobile.trim() || null, status: v.status, invitation_limit: v.invitation_limit, start_date: v.start_date || null, end_date: v.end_date || null, notes: v.notes || null })
        .eq("id", id);
      if (error) throw new Error(error.message);
      const current = new Set(customer.data?.templateIds ?? []);
      const next = new Set(v.template_ids);
      const toAdd = [...next].filter((t) => !current.has(t));
      const toRemove = [...current].filter((t) => !next.has(t));
      if (toAdd.length) {
        const { error: e1 } = await supabase.from("customer_template_access").insert(toAdd.map((template_id) => ({ customer_id: id, template_id })));
        if (e1) throw new Error(e1.message);
      }
      if (toRemove.length) {
        const { error: e2 } = await supabase.from("customer_template_access").delete().eq("customer_id", id).in("template_id", toRemove);
        if (e2) throw new Error(e2.message);
      }
    },
    onSuccess: () => {
      toast.success("Customer updated. Template access updated.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("Couldn't save changes. Please try again."),
  });

  const archive = useMutation({
    mutationFn: async (archived: boolean) => {
      const { error } = await supabase
        .from("customers")
        .update(archived ? { archived_at: new Date().toISOString(), status: "inactive" } : { archived_at: null, status: "active" })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return archived;
    },
    onSuccess: (archived) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      if (archived) {
        toast.success("Customer moved to Past Customers.");
        navigate({ to: "/admin/customers/past" });
      } else {
        toast.success("Customer restored to Active Customers.");
      }
    },
    onError: () => toast.error("Couldn't update this customer."),
  });

  const reset = useMutation({
    mutationFn: () => resetPw({ data: { customer_id: id, password: pw } }),
    onSuccess: () => {
      toast.success("Password updated.");
      setPw("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (customer.isLoading) return <PageSkeleton />;
  if (!customer.data) return <EmptyState title="Customer not found" action={<Button asChild><Link to="/admin/customers">Back to customers</Link></Button>} />;

  const c = customer.data;
  const used = c.usage?.used ?? 0;
  const opened = c.usage?.opened ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow="Customer"
        title={
          <span className="flex items-center gap-3">
            {c.name}{" "}
            {c.archived_at ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose px-2.5 py-0.5 text-xs font-medium text-rose-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                Archived / No access
              </span>
            ) : (
              <StatusBadge status={c.status} />
            )}
          </span>
        }
        description={`${c.email} · joined ${formatDate(c.created_at)}`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link to={c.archived_at ? "/admin/customers/past" : "/admin/customers"}><ArrowLeft /> All customers</Link>
            </Button>
            {c.archived_at ? (
              <Button variant="outline" disabled={archive.isPending} onClick={() => archive.mutate(false)}>
                <RotateCcw /> Restore customer
              </Button>
            ) : (
              <Button variant="outline" disabled={archive.isPending} onClick={() => setConfirmArchive(true)}>
                <Archive /> Delete customer
              </Button>
            )}
          </>
        }
      />
      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move this customer to Past Customers?</AlertDialogTitle>
            <AlertDialogDescription>
              {c.name} will keep all invitations and guest history, but will no longer be able to add guests or create
              invitations. You can restore them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmArchive(false); archive.mutate(true); }}>
              Move to Past Customers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Limit" value={c.invitation_limit} tone="lavender" />
        <StatsCard label="Used" value={used} tone="peach" hint={`${Math.max(c.invitation_limit - used, 0)} remaining`} />
        <StatsCard label="Opened" value={opened} tone="sage" hint={`${percent(opened, used)}% open rate`} />
        <StatsCard label="Access window" value={c.end_date ? formatDate(c.end_date, "d MMM") : "Open"} tone="sky" hint={c.start_date ? `from ${formatDate(c.start_date)}` : undefined} />
      </div>

      <CustomerForm
        key={c.updated_at}
        mode="edit"
        initial={{
          name: c.name,
          email: c.email,
          password: "",
          mobile: c.mobile ?? "",
          status: c.status as "active" | "inactive",
          invitation_limit: c.invitation_limit,
          start_date: c.start_date ?? "",
          end_date: c.end_date ?? "",
          notes: c.notes ?? "",
          template_ids: c.templateIds,
        }}
        onSubmit={(v) => save.mutate(v)}
        submitting={save.isPending}
        extra={
          <>
            <section className="card-elevated p-6">
              <h2 className="font-display text-2xl">Invitations</h2>
              {c.invitations.length ? (
                <Table className="mt-3">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Invitation</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.invitations.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.title}</TableCell>
                        <TableCell className="text-muted-foreground">{i.templates?.name}</TableCell>
                        <TableCell><StatusBadge status={i.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(i.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No invitations created yet.</p>
              )}
            </section>
            <section className="card-elevated p-6">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-display text-2xl">Reset login password</h2>
              </div>
              {c.user_id ? (
                <div className="mt-3 flex gap-2">
                  <Input type="text" placeholder="New password (min. 8)" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <Button type="button" variant="outline" disabled={pw.length < 8 || reset.isPending} onClick={() => reset.mutate()}>
                    Update
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">This customer record has no login attached yet.</p>
              )}
            </section>
          </>
        }
      />
    </div>
  );
}
