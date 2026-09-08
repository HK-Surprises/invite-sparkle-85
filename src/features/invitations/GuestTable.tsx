import { Eye, MoreHorizontal, Send, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyLinkButton, ShareButton, WhatsAppButton } from "@/components/shared/ShareActions";
import { useSendStatus } from "@/features/invitations/useSendStatus";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { timeAgo, initials } from "@/lib/format";
import type { Guest } from "@/types";

export function GuestTable({
  guests,
  invitationTitle,
  selectedId,
  onSelect,
  showMobile,
  compact,
}: {
  guests: Guest[];
  invitationTitle: string;
  selectedId?: string | null | undefined;
  onSelect?: ((guest: Guest) => void) | undefined;
  showMobile?: boolean | undefined;
  compact?: boolean | undefined;
}) {
  const qc = useQueryClient();
  const sendStatus = useSendStatus();
  const [toPending, setToPending] = useState<Guest | null>(null);
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("guests").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Guest removed.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Couldn't remove this guest. Please try again."),
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Guest</TableHead>
            {showMobile && <TableHead>Mobile</TableHead>}
            <TableHead>Group</TableHead>
            <TableHead className="text-center">People</TableHead>
            <TableHead>Invitation</TableHead>
            <TableHead>Last activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((g) => (
            <TableRow
              key={g.id}
              onClick={() => onSelect?.(g)}
              className={cn(onSelect && "cursor-pointer", selectedId === g.id && "bg-lavender/40 hover:bg-lavender/50")}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach text-xs font-semibold text-peach-foreground">
                    {initials(g.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{g.name}</p>
                    {!compact && <p className="font-mono text-[0.65rem] text-muted-foreground">/i/{g.token}</p>}
                  </div>
                </div>
              </TableCell>
              {showMobile && <TableCell className="text-muted-foreground">{g.mobile ?? "—"}</TableCell>}
              <TableCell className="text-muted-foreground">{g.group_name ?? "—"}</TableCell>
              <TableCell className="text-center">{g.people_count}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={g.send_status === "sent" ? "sent" : "pending"} />
                  <StatusBadge status={g.status} />
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{g.last_viewed_at ? timeAgo(g.last_viewed_at) : "—"}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  {onSelect && (
                    <Button size="sm" variant="ghost" onClick={() => onSelect(g)} aria-label={`Preview invitation for ${g.name}`}>
                      <Eye /> Preview
                    </Button>
                  )}
                  <CopyLinkButton token={g.token} label="Copy" />
                  <ShareButton
                    guest={g}
                    title={invitationTitle}
                    variant="soft"
                    onShared={() => {
                      if (g.send_status !== "sent") sendStatus.mutate({ id: g.id, status: "sent", name: g.name });
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="More">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`/i/${g.token}`} target="_blank" rel="noopener noreferrer">
                          Open in new tab
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <div>
                          <WhatsAppButton
                            guest={g}
                            title={invitationTitle}
                            variant="ghost"
                            className="h-auto w-full justify-start bg-transparent p-0 text-foreground shadow-none hover:bg-transparent"
                            onShared={() => {
                              if (g.send_status !== "sent") sendStatus.mutate({ id: g.id, status: "sent", name: g.name });
                            }}
                          />
                        </div>
                      </DropdownMenuItem>
                      {g.send_status === "sent" ? (
                        <DropdownMenuItem onClick={() => setToPending(g)}>
                          <Undo2 /> Mark as pending
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => sendStatus.mutate({ id: g.id, status: "sent", name: g.name })}>
                          <Send /> Mark as sent
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(g.id)}>
                        <Trash2 /> Remove guest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!toPending} onOpenChange={(o) => !o && setToPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {toPending?.name} back to Pending?</AlertDialogTitle>
            <AlertDialogDescription>
              Their invitation link stays exactly the same and their opened history is kept. They will simply move back to your “still to send” list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toPending) sendStatus.mutate({ id: toPending.id, status: "pending", name: toPending.name });
                setToPending(null);
              }}
            >
              Move to Pending
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
