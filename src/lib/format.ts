import { format, parseISO, formatDistanceToNow } from "date-fns";

export function formatDate(value?: string | null, pattern = "d MMM yyyy") {
  if (!value) return "—";
  try {
    return format(value.length === 10 ? parseISO(value) : new Date(value), pattern);
  } catch {
    return value;
  }
}

export function formatLongDate(value?: string | null) {
  return formatDate(value, "EEEE, d MMMM yyyy");
}

export function timeAgo(value?: string | null) {
  if (!value) return "—";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function invitationUrl(token: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/i/${token}`;
}

export function whatsappShareUrl(text: string, mobile?: string | null) {
  const digits = (mobile ?? "").replace(/\D/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function shareMessage(guestName: string, title: string, url: string) {
  return `Dear ${guestName}, you are warmly invited to ${title}. Here is your personal invitation: ${url}`;
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
