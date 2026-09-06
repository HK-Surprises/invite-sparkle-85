import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, UserCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { adminCustomersQuery, adminGuestsQuery, adminInvitationsQuery, adminViewsQuery } from "@/lib/queries";
import { percent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — InviteHub Admin" }, { name: "description", content: "Platform-wide invitation analytics." }, { property: "og:title", content: "Analytics — InviteHub Admin" }, { property: "og:description", content: "Platform-wide invitation analytics." }] }),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  const customers = useQuery(adminCustomersQuery);
  const guests = useQuery(adminGuestsQuery);
  const views = useQuery(adminViewsQuery);
  const invitations = useQuery(adminInvitationsQuery);
  const total = guests.data?.length ?? 0;
  const opened = guests.data?.filter((g) => g.status === "opened").length ?? 0;
  const byTemplate = Object.entries((invitations.data ?? []).reduce<Record<string, number>>((a, i) => { const k = i.templates?.name ?? "—"; a[k] = (a[k] ?? 0) + i.guestCount; return a; }, {})).map(([name, value]) => ({ name, value }));
  const byCategory = Object.entries((invitations.data ?? []).reduce<Record<string, number>>((a, i) => { const k = i.templates?.categories?.name ?? "Other"; a[k] = (a[k] ?? 0) + i.guestCount; return a; }, {})).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Analytics" description="Simple, useful numbers across the platform." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Total invitations" value={total} icon={Mail} tone="lavender" />
        <StatsCard label="Total views" value={views.data?.length} icon={Eye} tone="sky" />
        <StatsCard label="Opened" value={opened} icon={Eye} tone="sage" hint={`${percent(opened, total)}% open rate`} />
        <StatsCard label="Not opened" value={total - opened} icon={EyeOff} tone="rose" />
        <StatsCard label="Active customers" value={customers.data?.filter((c) => c.status === "active").length} icon={UserCheck} tone="peach" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[{ title: "Popular templates", data: byTemplate }, { title: "Popular categories", data: byCategory }].map((s) => (
          <section key={s.title} className="card-elevated p-6">
            <h2 className="font-display text-2xl">{s.title}</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart data={s.data} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Bar dataKey="value" name="Guests" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
