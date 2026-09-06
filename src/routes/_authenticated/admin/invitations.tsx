import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingState";
import { adminInvitationsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/invitations")({
  head: () => ({ meta: [{ title: "Invitations — InviteHub Admin" }, { name: "description", content: "All invitations across customers." }, { property: "og:title", content: "Invitations — InviteHub Admin" }, { property: "og:description", content: "All invitations across customers." }] }),
  component: AdminInvitationsPage,
});

function AdminInvitationsPage() {
  const invitations = useQuery(adminInvitationsQuery);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => (invitations.data ?? []).filter((i) => {
    if (status !== "all" && i.status !== status) return false;
    const n = q.trim().toLowerCase();
    return !n || i.title.toLowerCase().includes(n) || (i.customers?.name ?? "").toLowerCase().includes(n) || (i.templates?.categories?.name ?? "").toLowerCase().includes(n);
  }), [invitations.data, q, status]);

  return (
    <div>
      <PageHeader title="Invitations" description="Every invitation created by customers, with guest and open counts." />
      <section className="card-elevated overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-4">
          <div className="relative"><Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search invitation, customer, category…" className="w-72 rounded-xl pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
        </div>
        {invitations.isLoading ? <TableSkeleton /> : rows.length === 0 ? <EmptyState className="m-4" icon={Mail} title="No invitations created yet" /> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Invitation</TableHead><TableHead>Customer</TableHead><TableHead>Template</TableHead><TableHead className="text-right">Guests</TableHead><TableHead className="text-right">Opened</TableHead><TableHead>Status</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell>{i.customers?.name}</TableCell>
                    <TableCell className="text-muted-foreground">{i.templates?.name}<span className="block text-xs">{i.templates?.categories?.name}</span></TableCell>
                    <TableCell className="text-right">{i.guestCount}</TableCell>
                    <TableCell className="text-right">{i.openedCount}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(i.customers?.start_date)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(i.customers?.end_date)}</TableCell>
                    <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link to="/admin/customers/$id" params={{ id: i.customer_id }}>Customer</Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
