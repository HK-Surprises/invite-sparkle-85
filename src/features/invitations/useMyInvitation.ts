import { useQuery } from "@tanstack/react-query";
import { myCustomerQuery, myGuestsQuery, myInvitationsQuery } from "@/lib/queries";

/** Loads the customer, their invitations (selected = latest unless given) and guests. */
export function useMyInvitation(selectedId?: string) {
  const customer = useQuery(myCustomerQuery);
  const invitations = useQuery(myInvitationsQuery);
  const invitation = invitations.data?.find((i) => i.id === selectedId) ?? invitations.data?.[0] ?? null;
  const guests = useQuery({ ...myGuestsQuery(invitation?.id), enabled: !!invitation });

  const used = customer.data?.usage?.used ?? 0;
  const limit = customer.data?.invitation_limit ?? 0;

  return {
    customer: customer.data ?? null,
    invitations: invitations.data ?? [],
    invitation,
    guests: guests.data ?? [],
    isLoading: customer.isLoading || invitations.isLoading || (!!invitation && guests.isLoading),
    isError: customer.isError || invitations.isError || guests.isError,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
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
