import { useQuery } from "@tanstack/react-query";
import { myCustomerQuery, myGuestsQuery, myInvitationsQuery } from "@/lib/queries";

/** Loads the customer, their invitations (selected = latest unless given) and guests. */
export function useMyInvitation(selectedId?: string) {
  const customer = useQuery(myCustomerQuery);
  const invitations = useQuery(myInvitationsQuery);
  const invitation = invitations.data?.find((i) => i.id === selectedId) ?? invitations.data?.[0] ?? null;
  const guests = useQuery({ ...myGuestsQuery(invitation?.id), enabled: !!invitation });
  const allGuests = useQuery(myGuestsQuery());

  const limit = customer.data?.invitation_limit ?? 0;
  const every = allGuests.data ?? [];
  const totalGuests = every.length;
  const totalOpened = every.filter((g) => g.status === "opened").length;

  /** Per-invitation guest / opened counts for the dashboard breakdown. */
  const breakdown = (invitations.data ?? []).map((i) => {
    const rows = every.filter((g) => g.invitation_id === i.id);
    return {
      id: i.id,
      title: i.title,
      guests: rows.length,
      opened: rows.filter((g) => g.status === "opened").length,
    };
  });

  return {
    customer: customer.data ?? null,
    invitations: invitations.data ?? [],
    invitation,
    guests: guests.data ?? [],
    isLoading: customer.isLoading || invitations.isLoading || (!!invitation && guests.isLoading),
    isError: customer.isError || invitations.isError || guests.isError,
    /** Total guests created across every invitation (counts against the limit). */
    used: totalGuests,
    limit,
    remaining: Math.max(limit - totalGuests, 0),
    totalGuests,
    allGuests: every,
    totalOpened,
    breakdown,
    opened: guests.data?.filter((g) => g.status === "opened").length ?? 0,
    sent: guests.data?.filter((g) => g.send_status === "sent").length ?? 0,
    pending: guests.data?.filter((g) => g.send_status !== "sent").length ?? 0,
  };
}

export const invitationSearchSchema = (search: Record<string, unknown>): { inv?: string; guest?: string } => {
  const out: { inv?: string; guest?: string } = {};
  if (typeof search["inv"] === "string") out.inv = search["inv"] as string;
  if (typeof search["guest"] === "string") out.guest = search["guest"] as string;
  return out;
};
