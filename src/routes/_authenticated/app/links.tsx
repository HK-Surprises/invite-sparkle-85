import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageSkeleton } from "@/components/shared/LoadingState";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { QrCodeCard } from "@/components/shared/QrCodeCard";
import { CopyLinkButton, OpenLinkButton, ShareButton, WhatsAppButton } from "@/components/shared/ShareActions";
import { InvitationSwitcher } from "@/features/invitations/InvitationSwitcher";
import { invitationSearchSchema, useMyInvitation } from "@/features/invitations/useMyInvitation";
import { invitationUrl, shareMessage } from "@/lib/format";
import type { InvitationData } from "@/types";

export const Route = createFileRoute("/_authenticated/app/links")({
  validateSearch: invitationSearchSchema,
  head: () => ({ meta: [{ title: "Links & Sharing — InviteHub" }, { name: "description", content: "Copy, share or scan each guest's unique invitation link." }, { property: "og:title", content: "Links & Sharing — InviteHub" }, { property: "og:description", content: "Copy, share or scan each guest's unique invitation link." }] }),
  component: LinksPage,
});

function LinksPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { invitation, invitations, guests, isLoading } = useMyInvitation(search.inv);
  const guest = guests.find((g) => g.id === search.guest) ?? guests[0] ?? null;

  if (isLoading && !invitation) return <PageSkeleton />;
  if (!invitation) {
    return <EmptyState icon={Link2} title="Nothing to share yet" description="Create an invitation and add guests to get unique links." action={<Button asChild><Link to="/app/templates">Choose a template</Link></Button>} />;
  }
  if (!guest) {
    return <EmptyState icon={Link2} title="No guests yet" description="Add a guest to generate their unique invitation link." action={<Button asChild><Link to="/app/guests" search={{ inv: invitation.id }}>Go to guests</Link></Button>} />;
  }

  const url = invitationUrl(guest.token);
  return (
    <div>
      <PageHeader
        title="Links & Sharing"
        description="Every guest has a unique link. Choose a guest to copy, share or scan their invitation."
        actions={
          <>
            <InvitationSwitcher invitations={invitations} current={invitation} to="/app/links" />
            <Select value={guest.id} onValueChange={(v) => navigate({ to: "/app/links", search: (prev) => ({ ...prev, guest: v }) })}>
              <SelectTrigger className="w-60 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {guests.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card-elevated p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Selected guest</p>
            <h2 className="mt-1 font-display text-3xl">{guest.name}</h2>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Unique invitation URL</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <code className="flex-1 truncate rounded-xl bg-muted/70 px-4 py-2.5 text-sm">{url}</code>
              <CopyLinkButton token={guest.token} size="default" variant="default" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <ShareButton guest={guest} title={invitation.title} size="default" variant="outline" />
              <WhatsAppButton guest={guest} title={invitation.title} size="default" />
              <OpenLinkButton token={guest.token} size="default" />
            </div>
          </section>
          <section className="card-elevated p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Suggested message</p>
            <blockquote className="mt-2 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">{shareMessage(guest.name, invitation.title, url)}</blockquote>
          </section>
          <QrCodeCard url={url} label={`Scan to open ${guest.name}'s invitation`} />
        </div>
        <aside>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Personalized invitation for {guest.name}</p>
          <InvitationPreview key={guest.id} componentKey={invitation.templates?.component_key ?? ""} title={invitation.title} data={invitation.data as InvitationData} guestName={guest.name} />
        </aside>
      </div>
    </div>
  );
}
