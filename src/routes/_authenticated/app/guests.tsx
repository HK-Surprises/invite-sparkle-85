import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Link2, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton, TableSkeleton } from "@/components/shared/LoadingState";
import { AddGuestDialog } from "@/features/invitations/AddGuestDialog";
import { GuestTable } from "@/features/invitations/GuestTable";
import { InvitationSwitcher } from "@/features/invitations/InvitationSwitcher";
import { invitationSearchSchema, useMyInvitation } from "@/features/invitations/useMyInvitation";

export const Route = createFileRoute("/_authenticated/app/guests")({
  validateSearch: invitationSearchSchema,
  head: () => ({ meta: [{ title: "My Guests — InviteHub" }, { name: "description", content: "Manage guests and their personalized invitation links." }, { property: "og:title", content: "My Guests — InviteHub" }, { property: "og:description", content: "Manage guests and their personalized invitation links." }] }),
  component: GuestsPage,
});

function GuestsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { invitation, invitations, guests, isLoading, remaining, opened } = useMyInvitation(search.inv);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return guests.filter((g) => !n || g.name.toLowerCase().includes(n) || (g.mobile ?? "").includes(n) || (g.group_name ?? "").toLowerCase().includes(n));
  }, [guests, q]);

  if (isLoading && !invitation) return <PageSkeleton />;
  if (!invitation) {
    return (
      <EmptyState icon={Users} title="No invitation yet" description="Create an invitation first, then add your guests." action={<Button asChild><Link to="/app/templates">Choose a template</Link></Button>} />
    );
  }

  return (
    <div>
      <PageHeader
        title="My Guests"
        description={`Guests for ${invitation.title}. Each guest has a unique personalized invitation link.`}
        actions={
          <>
            <InvitationSwitcher invitations={invitations} current={invitation} to="/app/guests" />
            <AddGuestDialog invitationId={invitation.id} invitationTitle={invitation.title} remaining={remaining} onPreview={(g) => navigate({ to: "/app/invitation", search: { inv: invitation.id, guest: g.id } })} />
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total guests" value={guests.length} icon={Users} tone="lavender" />
        <StatsCard label="Opened" value={opened} icon={Eye} tone="sage" />
        <StatsCard label="Not opened" value={guests.length - opened} icon={EyeOff} tone="rose" />
        <StatsCard label="Remaining" value={remaining} icon={Link2} tone="sky" />
      </div>
      <section className="card-elevated overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <h2 className="font-display text-2xl">Guest list</h2>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, mobile, group…" className="w-64 rounded-xl pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {isLoading ? (
          <TableSkeleton />
        ) : guests.length === 0 ? (
          <EmptyState className="m-4" icon={Users} title="No guests yet" description="No guests added yet. Add your first guest to create a personalized invitation." action={<AddGuestDialog invitationId={invitation.id} invitationTitle={invitation.title} remaining={remaining} />} />
        ) : (
          <GuestTable guests={filtered} invitationTitle={invitation.title} showMobile onSelect={(g) => navigate({ to: "/app/invitation", search: { inv: invitation.id, guest: g.id } })} />
        )}
      </section>
    </div>
  );
}
