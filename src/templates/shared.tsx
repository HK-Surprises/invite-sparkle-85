import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/format";
import type { InvitationData } from "@/types";

/** Outer wrapper: scopes the palette class and fills the card. */
export function TemplateFrame({
  theme,
  className,
  children,
}: {
  theme: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(theme, "relative flex min-h-full w-full flex-col bg-tpl-bg text-tpl-fg", className)}>
      {children}
    </div>
  );
}

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-tpl-accent", className)} aria-hidden>
      <span className="h-px w-10 bg-current opacity-60" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2c1.5 3.5 4 6 8 8-4 2-6.5 4.5-8 8-1.5-3.5-4-6-8-8 4-2 6.5-4.5 8-8z" />
      </svg>
      <span className="h-px w-10 bg-current opacity-60" />
    </div>
  );
}

export function Greeting({ guestName, className }: { guestName: string; className?: string }) {
  return (
    <p className={cn("font-display text-2xl italic text-tpl-accent", className)}>Dear {guestName},</p>
  );
}

export function Names({ data, joiner = "&", className }: { data: InvitationData; joiner?: string; className?: string }) {
  const a = data.groomName || data.primaryName || "";
  const b = data.brideName;
  return (
    <h1 className={cn("font-display leading-[1.05] tracking-tight", className)}>
      {a}
      {b ? (
        <>
          <span className="mx-3 text-tpl-accent">{joiner}</span>
          {b}
        </>
      ) : null}
    </h1>
  );
}

export function Details({ data, className }: { data: InvitationData; className?: string }) {
  return (
    <dl className={cn("space-y-3 text-center", className)}>
      {data.eventDate && (
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-tpl-muted">When</dt>
          <dd className="font-display text-lg">{formatLongDate(data.eventDate)}</dd>
          {data.eventTime && <dd className="text-sm text-tpl-muted">{data.eventTime}</dd>}
        </div>
      )}
      {(data.venueName || data.venueAddress || data.city) && (
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-tpl-muted">Where</dt>
          {data.venueName && <dd className="font-display text-lg">{data.venueName}</dd>}
          {data.venueAddress && <dd className="text-sm text-tpl-muted">{data.venueAddress}</dd>}
          {data.city && <dd className="text-sm text-tpl-muted">{data.city}</dd>}
        </div>
      )}
    </dl>
  );
}

export function Message({ data, fallback, className }: { data: InvitationData; fallback: string; className?: string }) {
  return <p className={cn("mx-auto max-w-xs text-balance text-sm leading-relaxed text-tpl-muted", className)}>{data.message || fallback}</p>;
}

export function HostNote({ data, className }: { data: InvitationData; className?: string }) {
  if (!data.hostNote) return null;
  return <p className={cn("text-xs uppercase tracking-[0.2em] text-tpl-muted", className)}>With love, {data.hostNote}</p>;
}
