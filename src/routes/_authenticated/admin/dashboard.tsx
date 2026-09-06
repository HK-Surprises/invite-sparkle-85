import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, LayoutTemplate, Mail, UserCheck, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminCustomersQuery, adminGuestsQuery, adminInvitationsQuery, adminTemplatesQuery, adminViewsQuery } from "@/lib/queries";
import { formatDate, initials, timeAgo } from "@/lib/format";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin dashboard — InviteHub" }, { name: "description", content: "Platform overview: customers, templates, invitations and views." }, { property: "og:title", content: "Admin dashboard — InviteHub" }, { property: "og:description", content: "Platform overview." }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const customers = useQuery(adminCustomersQuery);
  const templates = useQuery(adminTemplatesQuery);
  const invitations = useQuery(adminInvitationsQuery);
  const guests = useQuery(adminGuestsQuery);
  const views = useQuery(adminViewsQuery);
  const loading = customers.isLoading || templates.isLoading || invitations.isLoading;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      day: format(d, "EEE"),
      views: (views.data ?? []).filter((v) => v.viewed_at.startsWith(key)).length,
      guests: (guests.data ?? []).filter((g) => g.created_at.startsWith(key)).length,
    };
  });

  const byCategory = Object.entries((invitations.data ?? []).reduce<Record<string, number>>((a, i) => { const k = i.templates?.categories?.name ?? "Other"; a[k] = (a[k] ?? 0) + i.guestCount; return a; }, {}));
  const byTemplate = Object.entries((invitations.data ?? []).reduce<Record<string, number>>((a, i) => { const k = i.templates?.name ?? "—"; a[k] = (a[k] ?? 0) + i.guestCount; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <PageHeader title="Dashboard" description="How the platform is doing today." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Total customers" value={customers.data?.length} icon={Users} tone="lavender" loading={loading} />
        <StatsCard label="Active customers" value={customers.data?.filter((c) => c.status === "active").length} icon={UserCheck} tone="sage" loading={loading} />
        <StatsCard label="Templates" value={templates.data?.length} icon={LayoutTemplate} tone="peach" loading={loading} />
        <StatsCard label="Invitations" value={guests.data?.length} icon={Mail} tone="sky" loading={loading} hint="personalized links" />
        <StatsCard label="Total views" value={views.data?.length} icon={Eye} tone="rose" loading={loading} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card-elevated p-6 lg:col-span-2">
          <h2 className="font-display text-2xl">Invitation activity · last 7 days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={days}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="guests" name="Guests added" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="views" name="Views" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card-elevated p-6">
          <h2 className="font-display text-2xl">Popular categories</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {byCategory.map(([k, v]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v} guests</span></li>
            ))}
            {byCategory.length === 0 && <p className="text-muted-foreground">No data yet.</p>}
          </ul>
          <h2 className="mt-6 font-display text-2xl">Popular templates</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {byTemplate.map(([k, v]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v}</span></li>
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent customers</h2>
            <Button asChild variant="link" size="sm"><Link to="/admin/customers">View all</Link></Button>
          </div>
          <ul className="mt-4 space-y-3">
            {customers.data?.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-xs font-semibold text-lavender-foreground">{initials(c.name)}</span>
                <div className="min-w-0 flex-1">
                  <Link to="/admin/customers/$id" params={{ id: c.id }} className="truncate text-sm font-medium hover:underline">{c.name}</Link>
                  <p className="text-xs text-muted-foreground">{c.usage?.used ?? 0}/{c.invitation_limit} used · {formatDate(c.created_at)}</p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="card-elevated p-6">
          <h2 className="font-display text-2xl">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(guests.data ?? []).filter((g) => g.last_viewed_at).sort((a, b) => (b.last_viewed_at! > a.last_viewed_at! ? 1 : -1)).slice(0, 6).map((g) => (
              <li key={g.id} className="flex justify-between gap-3"><span><span className="font-medium">{g.name}</span> opened their invitation</span><span className="text-muted-foreground">{timeAgo(g.last_viewed_at)}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
