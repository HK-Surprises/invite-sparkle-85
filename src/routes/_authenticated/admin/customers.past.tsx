import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Archive, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { adminPastCustomersQuery } from "@/lib/queries";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/customers/past")({
  head: () => ({
    meta: [
      { title: "Past Customers — InviteHub Admin" },
      { name: "description", content: "Archived customers with their history preserved." },
      { property: "og:title", content: "Past Customers — InviteHub Admin" },
      { property: "og:description", content: "Archived customers with their history preserved." },
    ],
  }),
  component: PastCustomersPage,
});

function PastCustomersPage() {
  const qc = useQueryClient();
  const customers = useQuery(adminPastCustomersQuery);
  const [q, setQ] = useState("");
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const restore = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").update({ archived_at: null, status: "active" }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Customer restored to Active Customers.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("Couldn't restore this customer."),
  });

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (customers.data ?? []).filter(
      (c) => !n || c.name.toLowerCase().includes(n) || c.email.toLowerCase().includes(n) || (c.mobile ?? "").includes(n),
    );
  }, [customers.data, q]);

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="Past Customers"
        description="Archived customers keep all invitations and guest history, but can no longer add guests or create invitations."
        actions={
          <Button asChild variant="ghost">
            <Link to="/admin/customers"><ArrowLeft /> Active customers</Link>
          </Button>
        }
      />
      <section className="card-elevated overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, email, mobile…" className="w-64 rounded-xl pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <p className="ml-auto text-xs text-muted-foreground">{rows.length} past customers</p>
        </div>
        {customers.isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState className="m-4" icon={Archive} title="No past customers" description="Customers you archive will appear here with their history intact." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Previous limit</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{initials(c.name)}</span>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.mobile ?? "—"}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{c.customer_type}</TableCell>
                    <TableCell className="text-right">{c.invitation_limit}</TableCell>
                    <TableCell className="text-right">{c.usage?.used ?? 0}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose px-2.5 py-0.5 text-xs font-medium text-rose-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        Archived / No access
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.archived_at ? formatDate(c.archived_at) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/admin/customers/$id" params={{ id: c.id }}>View</Link>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRestoreId(c.id)}>
                          <RotateCcw className="h-4 w-4" /> Restore
                        </Button>
                        <Button size="sm" variant="ghost" disabled title="Permanent deletion is not available yet">
                          Delete permanently
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <AlertDialog open={!!restoreId} onOpenChange={(o) => !o && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              They will move back to Active Customers and regain full access to their invitations and guests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (restoreId) restore.mutate(restoreId);
                setRestoreId(null);
              }}
            >
              Restore customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
