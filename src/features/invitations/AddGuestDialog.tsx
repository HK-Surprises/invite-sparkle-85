import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { invitationUrl } from "@/lib/format";
import { CopyLinkButton, ShareButton } from "@/components/shared/ShareActions";
import type { Guest } from "@/types";

export const LIMIT_MESSAGE = "You've reached your invitation limit. Please contact support to increase your limit.";

export function AddGuestDialog({
  invitationId,
  invitationTitle,
  remaining,
  onCreated,
  onPreview,
  trigger,
}: {
  invitationId: string;
  invitationTitle: string;
  remaining: number;
  onCreated?: (guest: Guest) => void;
  onPreview?: (guest: Guest) => void;
  trigger?: ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", group_name: "", people_count: "1" });
  const [created, setCreated] = useState<Guest | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("add_guest", {
        _invitation_id: invitationId,
        _name: form.name,
        ...(form.mobile ? { _mobile: form.mobile } : {}),
        ...(form.group_name ? { _group_name: form.group_name } : {}),
        _people_count: Math.max(1, Number(form.people_count) || 1),
      });
      if (error) {
        if (error.message.includes("LIMIT_REACHED")) throw new Error(LIMIT_MESSAGE);
        throw new Error(error.message);
      }
      return data as unknown as Guest;
    },
    onSuccess: (guest) => {
      setCreated(guest);
      toast.success(`Invitation created for ${guest.name}.`);
      qc.invalidateQueries({ queryKey: ["me"] });
      onCreated?.(guest);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function reset() {
    setForm({ name: "", mobile: "", group_name: "", people_count: "1" });
    setCreated(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus /> Add Guest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {created ? (
          <div className="space-y-5 py-2 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-sage-foreground">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <div>
              <DialogTitle className="font-display text-2xl">Invitation created for {created.name}</DialogTitle>
              <DialogDescription className="mt-1">A unique personalized invitation link is ready to share.</DialogDescription>
            </div>
            <div className="rounded-xl bg-muted/60 px-3 py-2 font-mono text-xs break-all">{invitationUrl(created.token)}</div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onPreview?.(created);
                  setOpen(false);
                  reset();
                }}
              >
                Preview Invitation
              </Button>
              <CopyLinkButton token={created.token} />
              <ShareButton guest={created} title={invitationTitle} />
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              Add another guest
            </Button>
          </div>
        ) : remaining <= 0 ? (
          <div className="space-y-3 py-2 text-center">
            <DialogTitle className="font-display text-2xl">Invitation limit reached</DialogTitle>
            <DialogDescription>{LIMIT_MESSAGE}</DialogDescription>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add a guest</DialogTitle>
              <DialogDescription>
                A unique invitation link will be generated. {remaining} invitation{remaining === 1 ? "" : "s"} remaining.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="g-name">Guest name *</Label>
              <Input id="g-name" required maxLength={120} placeholder="e.g. Amit Shah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="g-mobile">Mobile (optional)</Label>
                <Input id="g-mobile" placeholder="+91 98xxx xxxxx" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-people">People</Label>
                <Input id="g-people" type="number" min={1} max={50} value={form.people_count} onChange={(e) => setForm({ ...form, people_count: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-group">Group (optional)</Label>
              <Input id="g-group" placeholder="Family, Friends, Office…" value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Create personalized invitation
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
