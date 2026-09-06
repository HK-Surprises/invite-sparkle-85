import { Check, Copy, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { invitationUrl, shareMessage, whatsappShareUrl } from "@/lib/format";
import type { Guest } from "@/types";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string, message = "Invitation link copied.") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Please copy the link manually.");
    }
  };
  return { copied, copy };
}

export function CopyLinkButton({ token, size = "sm", variant = "outline", label = "Copy Link", ...rest }: { token: string; label?: string } & ButtonProps) {
  const { copied, copy } = useCopy();
  return (
    <Button size={size} variant={variant} onClick={() => copy(invitationUrl(token))} {...rest}>
      {copied ? <Check /> : <Copy />}
      {label}
    </Button>
  );
}

export async function nativeShare(guest: Pick<Guest, "name" | "token">, title: string) {
  const url = invitationUrl(guest.token);
  const text = shareMessage(guest.name, title, url);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch {
      /* user cancelled */
      return;
    }
  }
  window.open(whatsappShareUrl(text, null), "_blank", "noopener");
}

export function ShareButton({ guest, title, size = "sm", variant = "default", label = "Share", ...rest }: { guest: Pick<Guest, "name" | "token">; title: string; label?: string } & ButtonProps) {
  return (
    <Button size={size} variant={variant} onClick={() => nativeShare(guest, title)} {...rest}>
      <Share2 />
      {label}
    </Button>
  );
}

export function WhatsAppButton({ guest, title, size = "sm", ...rest }: { guest: Pick<Guest, "name" | "token" | "mobile">; title: string } & ButtonProps) {
  const url = invitationUrl(guest.token);
  return (
    <Button size={size} variant="whatsapp" asChild {...rest}>
      <a href={whatsappShareUrl(shareMessage(guest.name, title, url), guest.mobile)} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        WhatsApp
      </a>
    </Button>
  );
}

export function OpenLinkButton({ token, size = "sm", ...rest }: { token: string } & ButtonProps) {
  return (
    <Button size={size} variant="ghost" asChild {...rest}>
      <a href={`/i/${token}`} target="_blank" rel="noopener noreferrer">
        <ExternalLink />
        Open in New Tab
      </a>
    </Button>
  );
}
