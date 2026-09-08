import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownAZ, Clock, Eye, EyeOff, Mail, Search, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton, TableSkeleton } from "@/components/shared/LoadingState";
import { AddGuestDialog } from "@/features/invitations/AddGuestDialog";
import { GuestTable } from "@/features/invitations/GuestTable";
import { GuestPreviewPanel } from "@/features/invitations/GuestPreviewPanel";
import { InvitationSwitcher } from "@/features/invitations/InvitationSwitcher";
import { invitationSearchSchema, useMyInvitation } from "@/features/invitations/useMyInvitation";
import type { Guest } from "@/types";

export const Route = createFileRoute("/_authenticated/app/invitation/")({
  validateSearch: invitationSearchSchema,
  head: () => ({ meta: [{ title: "My Invitation — InviteHub" }, { name: "description", content: "Preview and share each guest's personalized invitation." }, { property: "og:title", content: "My Invitation — InviteHub" }, { property: "og:description", content: "Preview and share each guest's personalized invitation." }] }),
  component: MyInvitationPage,
});

function MyInvitationPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { invitation, invitations, guests, isLoading, remaining, opened } = useMyInvitation(search.inv);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "opened" | "not_opened">("all");

  const selected = guests.find((g) => g.id === search.guest) ?? guests[0] ?? null;
  const select = (g: Guest) => navigate({ to: "/app/invitation", search: (prev) => ({ ...prev, guest: g.id }), replace: true });

  const filtered = useMemo(
    () =>
      guests.filter((g) => {
        if (filter !== "all" && g.status !== filter) return false;
        const needle = q.trim().toLowerCase();
        return !needle || g.name.toLowerCase().includes(needle) || (g.group_name ?? "").toLowerCase().includes(needle);
      }),
    [guests, q, filter],
  );

  if (isLoading && !invitation) return <PageSkeleton />;

  if (!invitation) {
    return (
      <EmptyState
        icon={Mail}
        title="No invitations created yet"
        description="Choose a template and enter your details to create your first invitation."
        action={
          <Button asChild>
            <Link to="/app/templates">Choose a template</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight">{invitation.title}</h1>
            <StatusBadge status={invitation.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{invitation.templates?.name} · {invitation.templates?.categories?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InvitationSwitcher invitations={invitations} current={invitation} to="/app/invitation" />
          <AddGuestDialog invitationId={invitation.id} invitationTitle={invitation.title} remaining={remaining} onPreview={select} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total guests" value={guests.length} icon={Users} tone="lavender" />
        <StatsCard label="Personalized invitations" value={guests.length} icon={Mail} tone="peach" />
        <StatsCard label="Opened" value={opened} icon={Eye} tone="sage" />
        <StatsCard label="Not opened" value={guests.length - opened} icon={EyeOff} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="card-elevated overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
            <h2 className="font-display text-2xl">Guest invitations</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search guests…" className="w-56 rounded-xl pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-36 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All guests</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="not_opened">Not opened</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" disabled title="Bulk actions arrive in a future update">
                Bulk actions
              </Button>
            </div>
          </div>
          {isLoading ? (
            <TableSkeleton />
          ) : guests.length === 0 ? (
            <EmptyState className="m-4" icon={Users} title="No guests yet" description="No guests added yet. Add your first guest to create a personalized invitation." action={<AddGuestDialog invitationId={invitation.id} invitationTitle={invitation.title} remaining={remaining} onPreview={select} />} />
          ) : filtered.length === 0 ? (
            <EmptyState className="m-4" title="No matching guests" description="Try a different search or filter." />
          ) : (
            <GuestTable guests={filtered} invitationTitle={invitation.title} selectedId={selected?.id} onSelect={select} compact />
          )}
        </section>

        <aside className="xl:sticky xl:top-8 xl:self-start">
          <GuestPreviewPanel guest={selected} invitation={invitation} componentKey={invitation.templates?.component_key ?? ""} />
        </aside>
      </div>
    </div>
  );
}
