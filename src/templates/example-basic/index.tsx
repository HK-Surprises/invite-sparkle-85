import type { InvitationTemplateProps } from "../contract";
import { DateLine, EventsList, Reveal, VenueBlock, guestGreetingLine, parseEvents } from "../kit";

/**
 * EXAMPLE TEMPLATE — not a production design.
 *
 * It exists to demonstrate and validate the template contract:
 *  - receives only `InvitationTemplateProps`
 *  - renders the personalized guest name
 *  - renders invitation, date, event and venue information
 *  - is mobile-first and works with no optional data present
 *  - uses a scoped `tpl-*` palette plus the shared kit
 *
 * Copy this folder as the starting point for a real template.
 */
export function ExampleBasic({ title, data, guestName, peopleCount }: InvitationTemplateProps) {
  const events = parseEvents(data.events);
  const names = [data.groomName, data.brideName].filter(Boolean).join(" & ") || data.primaryName || title;

  return (
    <div className="tpl-minimal flex min-h-full w-full flex-1 flex-col bg-tpl-bg px-6 py-12 text-tpl-fg sm:px-10">
      <Reveal>
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">You are invited</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{names}</h1>
        <DateLine data={data} className="mt-3 text-sm text-tpl-muted" />
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-10 rounded-2xl bg-tpl-surface p-6 shadow-float">
          <p className="text-xs uppercase tracking-[0.25em] text-tpl-muted">Dear</p>
          <p className="mt-1 font-display text-2xl">{guestGreetingLine(guestName, peopleCount)}</p>
          {data.message && <p className="mt-3 text-sm leading-relaxed text-tpl-muted">{data.message}</p>}
        </div>
      </Reveal>

      {events.length > 0 && (
        <Reveal delay={200}>
          <div className="mt-10">
            <h2 className="text-xs uppercase tracking-[0.25em] text-tpl-muted">Events</h2>
            <EventsList events={events} className="mt-4" />
          </div>
        </Reveal>
      )}

      <Reveal delay={280}>
        <div className="mt-10">
          <VenueBlock
            data={data}
            buttonClassName="bg-tpl-accent text-tpl-surface"
            mutedClassName="text-tpl-muted"
          />
        </div>
      </Reveal>

      {data.blessing && (
        <p className="mt-12 text-center font-display text-lg italic text-tpl-muted">{data.blessing}</p>
      )}
    </div>
  );
}
