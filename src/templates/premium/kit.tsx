import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/format";
import type { InvitationData } from "@/types";

/* ------------------------------------------------------------------ *
 * Shared building blocks for the premium interactive templates.
 * Every block is data-driven: nothing here knows about a specific
 * customer, guest or event. Templates compose these with their own
 * palette + ornaments so each design still feels distinct.
 * ------------------------------------------------------------------ */

/** Fades + lifts children into view when they are scrolled to. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("inv-reveal", shown && "inv-reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Cinematic opening: the cover stays until the guest opens the invitation. */
export function CoverGate({
  cover,
  children,
}: {
  cover: (opening: boolean, open: () => void) => ReactNode;
  children: ReactNode;
}) {
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(() => setOpened(true), 1100);
    return () => clearTimeout(t);
  }, [opening]);

  if (!opened) {
    return <div className="relative h-full min-h-full w-full overflow-hidden">{cover(opening, () => setOpening(true))}</div>;
  }
  return <div className="inv-enter w-full">{children}</div>;
}

export interface EventItem {
  name: string;
  date?: string;
  time?: string;
  venue?: string;
}

/** "Name | Date | Time | Venue" per line. */
export function parseEvents(raw?: string): EventItem[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", date, time, venue] = line.split("|").map((p) => p.trim());
      const item: EventItem = { name };
      if (date) item.date = date;
      if (time) item.time = time;
      if (venue) item.venue = venue;
      return item;
    })
    .filter((e) => e.name);
}

export function parseGallery(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s))
    .slice(0, 6);
}

export function useCountdown(dateStr?: string, timeStr?: string) {
  const target = useMemo(() => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const hourMatch = timeStr?.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (hourMatch) {
      let h = Number(hourMatch[1]);
      const m = Number(hourMatch[2] ?? 0);
      const mer = hourMatch[3]?.toLowerCase();
      if (mer === "pm" && h < 12) h += 12;
      if (mer === "am" && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
    }
    return d;
  }, [dateStr, timeStr]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) return null;
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    past: false,
  };
}

export function Countdown({
  data,
  boxClassName,
  labelClassName,
}: {
  data: InvitationData;
  boxClassName?: string;
  labelClassName?: string;
}) {
  const c = useCountdown(data.eventDate, data.eventTime);
  if (!c) return null;
  const items: [string, number][] = [
    ["Days", c.days],
    ["Hours", c.hours],
    ["Minutes", c.minutes],
    ["Seconds", c.seconds],
  ];
  if (c.past) return <p className={cn("text-sm", labelClassName)}>The celebration has begun.</p>;
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(([label, value]) => (
        <div key={label} className={cn("rounded-xl px-1 py-3 text-center", boxClassName)}>
          <div className="font-display text-2xl leading-none tabular-nums">{String(value).padStart(2, "0")}</div>
          <div className={cn("mt-1 text-[0.55rem] uppercase tracking-[0.18em]", labelClassName)}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export function EventsList({
  events,
  itemClassName,
  accentClassName,
  mutedClassName,
}: {
  events: EventItem[];
  itemClassName?: string;
  accentClassName?: string;
  mutedClassName?: string;
}) {
  if (!events.length) return null;
  return (
    <ul className="space-y-3">
      {events.map((e, i) => (
        <li key={`${e.name}-${i}`}>
          <Reveal delay={i * 90}>
            <div className={cn("rounded-2xl px-5 py-4 text-center", itemClassName)}>
              <p className={cn("font-display text-xl", accentClassName)}>{e.name}</p>
              <p className={cn("mt-1 text-xs", mutedClassName)}>
                {[e.date, e.time].filter(Boolean).join(" · ")}
              </p>
              {e.venue && <p className={cn("text-xs", mutedClassName)}>{e.venue}</p>}
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

export function Gallery({ urls, className }: { urls: string[]; className?: string }) {
  if (!urls.length) return null;
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {urls.map((src, i) => (
        <Reveal key={src} delay={i * 70} className={i === 0 ? "col-span-2" : undefined}>
          <img
            src={src}
            alt="A moment from the couple's journey"
            loading="lazy"
            className={cn("w-full rounded-2xl object-cover", i === 0 ? "h-48" : "h-28")}
          />
        </Reveal>
      ))}
    </div>
  );
}

export function VenueBlock({
  data,
  buttonClassName,
  mutedClassName,
}: {
  data: InvitationData;
  buttonClassName?: string;
  mutedClassName?: string;
}) {
  const mapUrl =
    data.venueMapUrl ||
    (data.venueName || data.city
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [data.venueName, data.venueAddress, data.city].filter(Boolean).join(", "),
        )}`
      : "");
  return (
    <div className="text-center">
      {data.venueName && <p className="font-display text-2xl">{data.venueName}</p>}
      {data.venueAddress && <p className={cn("mt-1 text-sm", mutedClassName)}>{data.venueAddress}</p>}
      {data.city && <p className={cn("text-sm", mutedClassName)}>{data.city}</p>}
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-105",
            buttonClassName,
          )}
        >
          View on map
        </a>
      )}
    </div>
  );
}

export function DateLine({ data, className }: { data: InvitationData; className?: string }) {
  if (!data.eventDate) return null;
  return (
    <p className={className}>
      {formatLongDate(data.eventDate)}
      {data.eventTime ? ` · ${data.eventTime}` : ""}
    </p>
  );
}

/** Gentle floating decorative elements (petals, sparkles, diyas…). */
export function Floaters({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {items.map((glyph, i) => (
        <span
          key={i}
          className="inv-float absolute select-none"
          style={{
            left: `${(i * 37) % 92}%`,
            top: `${(i * 53) % 88}%`,
            fontSize: `${10 + ((i * 7) % 14)}px`,
            animationDelay: `${(i % 6) * 0.9}s`,
            animationDuration: `${7 + (i % 5)}s`,
          }}
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}

export function ScrollCue({ className }: { className?: string }) {
  return (
    <div className={cn("inv-bob mt-8 flex flex-col items-center gap-1 text-[0.6rem] uppercase tracking-[0.3em]", className)}>
      <span>Scroll</span>
      <span className="h-6 w-px bg-current opacity-60" />
    </div>
  );
}

export function guestGreetingLine(guestName: string, peopleCount?: number) {
  if (peopleCount && peopleCount > 1) return `${guestName} & family (${peopleCount} guests)`;
  return guestName;
}
