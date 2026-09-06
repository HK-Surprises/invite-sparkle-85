import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Eye, HelpCircle, LayoutTemplate, Link2, Mail, Plus, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { AddGuestDialog } from "@/features/invitations/AddGuestDialog";
import { useMyInvitation } from "@/features/invitations/useMyInvitation";
import { myTemplatesQuery, platformSettingsQuery } from "@/lib/queries";
import { timeAgo, initials, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — InviteHub" }, { name: "description", content: "Your personalized invitations at a glance." }, { property: "og:title", content: "Dashboard — InviteHub" }, { property: "og:description", content: "Your personalized invitations at a glance." }] }),
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { customer, invitation, guests, isLoading, used, limit, remaining, opened, invitations } = useMyInvitation();
  const templates = useQuery(myTemplatesQuery);
  const settings = useQuery(platformSettingsQuery);
  const firstName = customer?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Hi {firstName} 👋</h1>
        <p className="mt-1 text-muted-foreground">Let's create something special for your guests.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Active invitation" value={invitations.filter((i) => i.status === "active").length} icon={Mail} tone="lavender" loading={isLoading} />
        <StatsCard label="Guests" value={used} icon={Users} tone="peach" loading={isLoading} />
        <StatsCard label="Opened" value={opened} icon={Eye} tone="sage" loading={isLoading} hint={invitation ? `of ${guests.length} in ${invitation.title}` : undefined} />
        <StatsCard label="Remaining" value={remaining} icon={Link2} tone="sky" loading={isLoading} hint={`of ${limit} invitations`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Quick actions</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="soft" className="h-auto justify-start gap-3 rounded-2xl p-4">
              <Link to="/app/templates">
                <LayoutTemplate /> <span>Choose Template</span> <ArrowRight className="ml-auto" />
              </Link>
            </Button>
            {invitation ? (
              <AddGuestDialog
                invitationId={invitation.id}
                invitationTitle={invitation.title}
                remaining={remaining}
                trigger={
                  <Button variant="soft" className="h-auto justify-start gap-3 rounded-2xl p-4">
                    <Plus /> <span>Add Guest</span> <ArrowRight className="ml-auto" />
                  </Button>
                }
              />
            ) : (
              <Button variant="soft" className="h-auto justify-start gap-3 rounded-2xl p-4" disabled>
                <Plus /> <span>Add Guest</span>
              </Button>
            )}
            <Button asChild variant="soft" className="h-auto justify-start gap-3 rounded-2xl p-4">
              <Link to="/app/invitation">
                <Mail /> <span>View Invitation</span> <ArrowRight className="ml-auto" />
              </Link>
            </Button>
            <Button asChild variant="soft" className="h-auto justify-start gap-3 rounded-2xl p-4">
              <Link to="/app/links">
                <Share2 /> <span>Share Invitation</span> <ArrowRight className="ml-auto" />
              </Link>
            </Button>
          </div>

          {invitation && (
            <div className="mt-6 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Current invitation</p>
                  <p className="font-display text-xl">{invitation.title}</p>
                </div>
                <StatusBadge status={invitation.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {invitation.templates?.name} · created {formatDate(invitation.created_at)}
              </p>
            </div>
          )}
        </section>

        <section className="card-elevated p-6">
          <h2 className="font-display text-2xl">Invitation usage</h2>
          <p className="mt-4 font-display text-5xl">
            {used}
            <span className="text-2xl text-muted-foreground"> / {limit}</span>
          </p>
          <Progress value={limit ? (used / limit) * 100 : 0} className="mt-3 h-2" />
          <p className="mt-2 text-sm text-muted-foreground">{remaining} personalized invitations remaining</p>
          {customer?.end_date && (
            <p className="mt-4 text-xs text-muted-foreground">Access valid until {formatDate(customer.end_date)}</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Popular templates</h2>
            <Button asChild variant="link" size="sm">
              <Link to="/app/templates">View all</Link>
            </Button>
          </div>
          {templates.data?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templates.data.slice(0, 3).map((t) => (
                <TemplateCard key={t.id} name={t.name} categoryName={t.categories?.name} componentKey={t.component_key} />
              ))}
            </div>
          ) : (
            <EmptyState title="No templates yet" description="No templates are currently assigned to your account." />
          )}
        </section>

        <section className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="font-display text-2xl">Recent guests</h2>
            {guests.length ? (
              <ul className="mt-4 space-y-3">
                {guests.slice(0, 5).map((g) => (
                  <li key={g.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach text-xs font-semibold text-peach-foreground">{initials(g.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.last_viewed_at ? `Opened ${timeAgo(g.last_viewed_at)}` : `Added ${timeAgo(g.created_at)}`}</p>
                    </div>
                    <StatusBadge status={g.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No guests added yet.</p>
            )}
          </div>
          <div className="rounded-2xl bg-peach/60 p-5">
            <div className="flex items-center gap-2 text-peach-foreground">
              <HelpCircle className="h-4 w-4" />
              <p className="text-sm font-semibold">Need help?</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Reach us at {settings.data?.support_email ?? "support@invitehub.in"}
              {settings.data?.support_phone ? ` or ${settings.data.support_phone}` : ""}.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
