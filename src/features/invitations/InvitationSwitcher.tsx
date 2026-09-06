import { useNavigate } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Invitation } from "@/types";

export function InvitationSwitcher({ invitations, current, to }: { invitations: Invitation[]; current: Invitation | null; to: "/app/invitation" | "/app/guests" | "/app/links" | "/app/analytics" }) {
  const navigate = useNavigate();
  if (invitations.length < 2 || !current) return null;
  return (
    <Select value={current.id} onValueChange={(v) => navigate({ to, search: { inv: v } })}>
      <SelectTrigger className="w-60 rounded-xl">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {invitations.map((i) => (
          <SelectItem key={i.id} value={i.id}>
            {i.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
