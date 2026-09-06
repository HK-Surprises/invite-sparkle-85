import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Link2, Mail, Percent, Users } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { PageSkeleton } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { InvitationSwitcher } from "@/features/invitations/InvitationSwitcher";
import { invitationSearchSchema, useMyInvitation } from "@/features/invitations/useMyInvitation";
import { percent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/analytics")({
  validateSearch: invitationSearchSchema,
  head: () => ({ meta: [{ title: "Analytics — InviteHub" }, { name: "description", content: "See how many guests have opened their invitation." }, { property: "og:title", content: "Analytics — InviteHub" }, { property: "og:description", content: "See how many guests have opened their invitation." }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const search = Route.useSearch();
  const { invitation, invitations, guests, isLoading, used, remaining, opened } = useMyInvitation(search.inv);
  if (isLoading && !invitation) return <PageSkeleton />;
  if (!invitation) return <EmptyState title="No data yet" description="Create an invitation and add guests to see analytics." />;

  const notOpened = guests.length - opened;
  const rate = percent(opened, guests.length);
  const groups = Object.entries(
    guests.reduce<Record<string, { total: number; opened: number }>>((acc, g) => {
      const k = g.group_name ?? "Ungrouped";
      acc[k] ??= { total: 0, opened: 0 };
      acc[k].total += 1;
      if (g.status === "opened") acc[k].opened += 1;
      return acc;
    }, {}),
  );

  return (
    <div>
      <PageHeader title="Analytics" description={`How ${invitation.title} is doing.`} actions={<InvitationSwitcher invitations={invitations} current={invitation} to="/app/analytics" />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total guests" value={guests.length} icon={Users} tone="lavender" />
        <StatsCard label="Total invitations" value={guests.length} icon={Mail} tone="peach" />
        <StatsCard label="Opened" value={opened} icon={Eye} tone="sage" />
        <StatsCard label="Not opened" value={notOpened} icon={EyeOff} tone="rose" />
        <StatsCard label="Open rate" value={`${rate}%`} icon={Percent} tone="sky" />
        <StatsCard label="Used" value={used} icon={Link2} tone="lavender" hint="across all invitations" />
        <StatsCard label="Remaining" value={remaining} icon={Link2} tone="peach" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-elevated p-6">
          <h2 className="font-display text-2xl">Opened vs not opened</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ name: "Opened", value: opened }, { name: "Not opened", value: notOpened }]} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  <Cell fill="var(--chart-4)" />
                  <Cell fill="var(--chart-1)" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center font-display text-3xl">{rate}% open rate</p>
        </section>
        <section className="card-elevated p-6">
          <h2 className="font-display text-2xl">By group</h2>
          <ul className="mt-4 space-y-3">
            {groups.map(([name, v]) => (
              <li key={name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">
                    {v.opened}/{v.total} opened
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent(v.opened, v.total)}%` }} />
                </div>
              </li>
            ))}
            {groups.length === 0 && <p className="text-sm text-muted-foreground">No guests yet.</p>}
          </ul>
        </section>
      </div>
    </div>
  );
}
