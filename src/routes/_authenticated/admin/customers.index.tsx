import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingState";
import { adminCustomersQuery } from "@/lib/queries";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/customers/")({
  head: () => ({ meta: [{ title: "Customers — InviteHub Admin" }, { name: "description", content: "Manage customers, limits and template access." }, { property: "og:title", content: "Customers — InviteHub Admin" }, { property: "og:description", content: "Manage customers, limits and template access." }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const customers = useQuery(adminCustomersQuery);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const rows = useMemo(
    () =>
      (customers.data ?? []).filter((c) => {
        if (status !== "all" && c.status !== status) return false;
        if (type !== "all" && c.customer_type !== type) return false;
        const n = q.trim().toLowerCase();
        return !n || c.name.toLowerCase().includes(n) || c.email.toLowerCase().includes(n) || (c.mobile ?? "").includes(n);
      }),
    [customers.data, q, status, type],
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Every customer gets a login, an invitation limit, allowed templates and an access window."
        actions={
          <Button asChild>
            <Link to="/admin/customers/new">
              <Plus /> Add Customer
            </Link>
          </Button>
        }
      />
      <section className="card-elevated overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, email, mobile…" className="w-64 rounded-xl pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
          <p className="ml-auto text-xs text-muted-foreground">{rows.length} customers</p>
        </div>
        {customers.isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState className="m-4" icon={Users} title="No customers found" description={customers.data?.length ? "Try a different search or filter." : "Add your first customer to get started."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Limit</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => {
                  const used = c.usage?.used ?? 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-xs font-semibold text-lavender-foreground">{initials(c.name)}</span>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.mobile ?? "—"}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{c.customer_type}</TableCell>
                      <TableCell className="text-right">{c.invitation_limit}</TableCell>
                      <TableCell className="text-right">{used}</TableCell>
                      <TableCell className="text-right font-medium">{Math.max(c.invitation_limit - used, 0)}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/admin/customers/$id" params={{ id: c.id }}>Manage</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
