import type { TemplateRenderProps } from "@/types";
import {
  CoverGate,
  Countdown,
  DateLine,
  EventsList,
  Floaters,
  Gallery,
  Reveal,
  ScrollCue,
  VenueBlock,
  guestGreetingLine,
  parseEvents,
  parseGallery,
} from "@/templates/premium/kit";

/** Template 01 — Royal Prestige: gold, ivory and deep maroon with a door reveal. */
export function RoyalPrestige({ data, guestName, peopleCount }: TemplateRenderProps) {
  const events = parseEvents(data.events);
  const gallery = parseGallery(data.galleryUrls);
  const couple = [data.groomName, data.brideName].filter(Boolean);

  return (
    <div className="tpl-royal min-h-full w-full bg-tpl-bg font-sans text-tpl-fg">
      <CoverGate
        cover={(opening, open) => (
          <div className="relative flex h-full min-h-full items-center justify-center overflow-hidden bg-tpl-bg px-6">
            <Floaters items={["✦", "❋", "✧", "✦", "❉", "✧", "✦", "❋"]} className="text-tpl-accent/50" />
            {/* Two ornate doors that swing apart */}
            {["left", "right"].map((side) => (
              <div
                key={side}
                className="absolute top-0 bottom-0 w-1/2 border-tpl-accent/50 bg-tpl-accent-soft transition-transform duration-[1100ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
                style={{
                  [side]: 0,
                  transformOrigin: side === "left" ? "left center" : "right center",
                  transform: opening ? `perspective(1200px) rotateY(${side === "left" ? "-105deg" : "105deg"})` : "none",
                  borderRightWidth: side === "left" ? 1 : 0,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, oklch(1 0 0 / 4%) 0 2px, transparent 2px 12px)",
                }}
                aria-hidden
              >
                <div className="absolute inset-4 rounded-[3rem] border border-tpl-accent/40" />
                <div className="absolute inset-8 rounded-[2.5rem] border border-tpl-accent/20" />
              </div>
            ))}
            <div
              className="relative z-10 text-center transition-all duration-700"
              style={{ opacity: opening ? 0 : 1, transform: opening ? "scale(1.1)" : "none" }}
            >
              <p className="text-[0.6rem] uppercase tracking-[0.45em] text-tpl-accent">|| Shubh Vivah ||</p>
              <h1 className="inv-gold-text mt-5 font-display text-5xl leading-tight">
                {couple.join(" & ") || "Our Wedding"}
              </h1>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-tpl-muted">
                An invitation for {guestName}
              </p>
              <button
                type="button"
                onClick={open}
                className="mt-10 rounded-full border border-tpl-accent bg-tpl-accent/10 px-8 py-3 text-[0.65rem] uppercase tracking-[0.3em] text-tpl-accent transition-transform duration-300 hover:scale-105"
              >
                Open invitation
              </button>
            </div>
          </div>
        )}
      >
        <main className="relative overflow-hidden pb-16">
          <Floaters items={["✦", "✧", "❋", "✦", "✧"]} className="text-tpl-accent/25" />

          {/* Greeting */}
          <section className="relative px-7 pt-14 text-center">
            <Reveal>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-tpl-accent">With great joy</p>
              <p className="mt-4 font-display text-3xl italic text-tpl-accent">
                Dear {guestGreetingLine(guestName, peopleCount)},
              </p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-tpl-muted">
                You are cordially invited to celebrate the wedding of
              </p>
            </Reveal>
          </section>

          {/* Couple hero */}
          <section className="relative px-7 pt-8 text-center">
            <Reveal delay={120}>
              <div className="relative mx-auto max-w-sm rounded-[2rem] border border-tpl-accent/40 bg-tpl-accent-soft/60 px-6 py-10">
                <div className="absolute inset-2 rounded-[1.7rem] border border-tpl-accent/25" aria-hidden />
                <h2 className="inv-gold-text font-display text-5xl leading-[1.05]">
                  {data.groomName}
                  {data.brideName && (
                    <>
                      <span className="mx-2 text-4xl">&</span>
                      {data.brideName}
                    </>
                  )}
                </h2>
                <DateLine data={data} className="mt-5 text-xs uppercase tracking-[0.28em] text-tpl-muted" />
                {data.hostNote && (
                  <p className="mt-6 text-[0.65rem] uppercase tracking-[0.25em] text-tpl-muted">
                    With blessings of {data.hostNote}
                  </p>
                )}
              </div>
              <ScrollCue className="text-tpl-accent/70" />
            </Reveal>
          </section>

          {/* Countdown */}
          <section className="px-7 pt-16">
            <Reveal>
              <p className="mb-4 text-center text-[0.6rem] uppercase tracking-[0.4em] text-tpl-accent">
                Counting every moment
              </p>
              <Countdown
                data={data}
                boxClassName="border border-tpl-accent/35 bg-tpl-accent-soft/50 text-tpl-fg"
                labelClassName="text-tpl-muted"
              />
            </Reveal>
          </section>

          {/* Events */}
          {events.length > 0 && (
            <section className="px-7 pt-16">
              <Reveal>
                <h3 className="mb-5 text-center font-display text-3xl text-tpl-accent">Wedding functions</h3>
              </Reveal>
              <EventsList
                events={events}
                itemClassName="border border-tpl-accent/30 bg-tpl-accent-soft/40"
                accentClassName="text-tpl-fg"
                mutedClassName="text-tpl-muted"
              />
            </section>
          )}

          {/* Story + gallery */}
          {(data.story || gallery.length > 0) && (
            <section className="px-7 pt-16">
              <Reveal>
                <h3 className="mb-4 text-center font-display text-3xl text-tpl-accent">Our story</h3>
                {data.story && (
                  <p className="mx-auto max-w-xs text-balance text-center text-sm leading-relaxed text-tpl-muted">
                    {data.story}
                  </p>
                )}
              </Reveal>
              <div className="mt-5">
                <Gallery urls={gallery} />
              </div>
            </section>
          )}

          {/* Venue */}
          <section className="px-7 pt-16">
            <Reveal>
              <h3 className="mb-4 text-center font-display text-3xl text-tpl-accent">Venue</h3>
              <VenueBlock
                data={data}
                mutedClassName="text-tpl-muted"
                buttonClassName="border border-tpl-accent text-tpl-accent"
              />
            </Reveal>
          </section>

          {/* Closing */}
          <section className="px-7 pt-16 text-center">
            <Reveal>
              <div className="mx-auto max-w-xs rounded-[1.75rem] border border-tpl-accent/35 px-6 py-8">
                <p className="text-sm leading-relaxed text-tpl-muted">
                  {data.message || "Your presence would make our special day even more meaningful."}
                </p>
                <p className="mt-5 font-display text-2xl italic text-tpl-accent">
                  {data.blessing || "Shubh Vivah"}
                </p>
              </div>
            </Reveal>
          </section>
        </main>
      </CoverGate>
    </div>
  );
}
