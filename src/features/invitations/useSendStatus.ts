import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SendStatus = "pending" | "sent";

/** Marks a guest invitation as sent or pending. Never touches the token, link or opened tracking. */
export function useSendStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SendStatus; name?: string }) => {
      const patch =
        status === "sent"
          ? { send_status: "sent", sent_at: new Date().toISOString() }
          : { send_status: "pending" };
      const { error } = await supabase.from("guests").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.status === "sent"
          ? `${vars.name ?? "Guest"} moved to Sent.`
          : `${vars.name ?? "Guest"} moved back to Pending.`,
      );
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Couldn't update the sending status. Please try again."),
  });
}
