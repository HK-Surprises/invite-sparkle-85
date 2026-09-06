import { Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { CopyLinkButton, OpenLinkButton, ShareButton, WhatsAppButton } from "@/components/shared/ShareActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate, invitationUrl, shareMessage, timeAgo } from "@/lib/format";
import type { Guest, Invitation, InvitationData } from "@/types";

export function GuestPreviewPanel({
  guest,
  invitation,
  componentKey,
}: {
  guest: Guest | null;
  invitation: Invitation;
  componentKey: string;
}) {
  if (!guest) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Select a guest"
        description="Pick any guest from the list to see exactly what they will receive."
      />
    );
  }
  const url = invitationUrl(guest.token);
  const data = invitation.data as InvitationData;

  return (
    <div className="card-elevated overflow-hidden">
      <div className="border-b bg-lavender/40 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Guest Invitation Preview</p>
        <h3 className="mt-1 font-display text-2xl">Personalized invitation for {guest.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Every guest receives a unique personalized invitation.</p>
      </div>
      <Tabs defaultValue="view" className="p-5">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">Invitation View</TabsTrigger>
          <TabsTrigger value="message">Message</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="mt-5">
          <InvitationPreview key={guest.id} componentKey={componentKey} title={invitation.title} data={data} guestName={guest.name} peopleCount={guest.people_count} />
        </TabsContent>
        <TabsContent value="message" className="mt-5 space-y-3">
          <p className="text-sm text-muted-foreground">Suggested message to send with the link:</p>
          <blockquote className="rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">{shareMessage(guest.name, invitation.title, url)}</blockquote>
        </TabsContent>
        <TabsContent value="details" className="mt-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Guest</dt>
            <dd className="font-medium">{guest.name}</dd>
            <dt className="text-muted-foreground">Mobile</dt>
            <dd>{guest.mobile ?? "—"}</dd>
            <dt className="text-muted-foreground">Group</dt>
            <dd>{guest.group_name ?? "—"}</dd>
            <dt className="text-muted-foreground">People</dt>
            <dd>{guest.people_count}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge status={guest.status} />
            </dd>
            <dt className="text-muted-foreground">Last viewed</dt>
            <dd>{guest.last_viewed_at ? timeAgo(guest.last_viewed_at) : "Not yet"}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(guest.created_at)}</dd>
            <dt className="text-muted-foreground">Link</dt>
            <dd className="font-mono text-xs break-all">{url}</dd>
          </dl>
        </TabsContent>
      </Tabs>
      <div className="flex flex-wrap gap-2 border-t p-4">
        <CopyLinkButton token={guest.token} size="default" />
        <ShareButton guest={guest} title={invitation.title} size="default" />
        <WhatsAppButton guest={guest} title={invitation.title} size="default" />
        <OpenLinkButton token={guest.token} size="default" />
      </div>
    </div>
  );
}
