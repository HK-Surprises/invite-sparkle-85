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

/** Template 03 — Emerald Royale: deep emerald + gold, Mughal-inspired arches. */
export function EmeraldRoyale({ data, guestName, peopleCount }: TemplateRenderProps) {
  const events = parseEvents(data.events);
  const gallery = parseGallery(data.galleryUrls);
  const couple = [data.groomName, data.brideName].filter(Boolean);

  return (
    <div className="tpl-emerald min-h-full w-full bg-tpl-bg font-sans text-tpl-fg">
      <CoverGate
        cover={(opening, open) => (
          <div className="relative flex h-full min-h-full items-center justify-center overflow-hidden bg-tpl-bg px-6">
            <Floaters items={["✦", "◈", "✧", "❖", "✦", "◈", "✧"]} className="text-tpl-accent/45" />
            {/* Curtains parting */}
            {["left", "right"].map((side) => (
              <div
                key={side}
                className="absolute top-0 bottom-0 w-1/2 transition-transform duration-[1100ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
                style={{
                  [side]: 0,
                  transform: opening ? `translateX(${side === "left" ? "-102%" : "102%"})` : "none",
                  backgroundImage:
                    "repeating-linear-gradient(90deg, oklch(0.26 0.07 165) 0 10px, oklch(0.31 0.07 165) 10px 22px)",
                }}
                aria-hidden
              />
            ))}
            <div
              className="relative z-10 text-center transition-all duration-700"
              style={{ opacity: opening ? 0 : 1, transform: opening ? "translateY(-14px)" : "none" }}
            >
              <div className="mx-auto w-64 rounded-t-full border border-tpl-accent/60 px-6 pt-12 pb-8">
                <p className="text-[0.6rem] uppercase tracking-[0.45em] text-tpl-accent">The wedding of</p>
                <h1 className="inv-gold-text mt-4 font-display text-4xl leading-tight">
                  {couple.join(" & ") || "Our Wedding"}
                </h1>
                <p className="mt-4 text-[0.6rem] uppercase tracking-[0.3em] text-tpl-muted">for {guestName}</p>
              </div>
              <button
                type="button"
                onClick={open}
                className="mt-8 rounded-full bg-tpl-accent px-8 py-3 text-[0.65rem] uppercase tracking-[0.3em] text-tpl-bg transition-transform duration-300 hover:scale-105"
              >
                Unveil invitation
              </button>
            </div>
          </div>
        )}
      >
        <main className="relative overflow-hidden pb-16">
          <Floaters items={["✦", "◈", "✧", "❖", "✦"]} className="text-tpl-accent/20" />

          <section className="relative px-7 pt-14 text-center">
            <Reveal>
              <p className="text-[0.6rem] uppercase tracking-[0.42em] text-tpl-accent">|| Shubh Lagna ||</p>
              <p className="mt-4 font-display text-3xl italic text-tpl-accent">
                Dear {guestGreetingLine(guestName, peopleCount)},
              </p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-tpl-muted">
                Your presence is requested at our wedding celebrations.
              </p>
            </Reveal>
          </section>

          <section className="px-7 pt-10 text-center">
            <Reveal delay={110}>
              <div className="relative mx-auto max-w-sm rounded-t-[9rem] rounded-b-[2rem] border border-tpl-accent/45 bg-tpl-surface px-6 pt-14 pb-10">
                <div className="absolute inset-2 rounded-t-[8.5rem] rounded-b-[1.7rem] border border-tpl-accent/20" aria-hidden />
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
                  <p className="mt-6 text-[0.65rem] uppercase tracking-[0.22em] text-tpl-muted">{data.hostNote}</p>
                )}
              </div>
              <ScrollCue className="text-tpl-accent/70" />
            </Reveal>
          </section>

          <section className="px-7 pt-16">
            <Reveal>
              <p className="mb-4 text-center text-[0.6rem] uppercase tracking-[0.4em] text-tpl-accent">
                The countdown begins
              </p>
              <Countdown
                data={data}
                boxClassName="border border-tpl-accent/35 bg-tpl-surface"
                labelClassName="text-tpl-muted"
              />
            </Reveal>
          </section>

          {events.length > 0 && (
            <section className="px-7 pt-16">
              <Reveal>
                <h3 className="mb-5 text-center font-display text-3xl text-tpl-accent">Functions</h3>
              </Reveal>
              <EventsList
                events={events}
                itemClassName="border border-tpl-accent/25 bg-tpl-surface"
                accentClassName="text-tpl-fg"
                mutedClassName="text-tpl-muted"
              />
            </section>
          )}

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

          <section className="px-7 pt-16">
            <Reveal>
              <h3 className="mb-4 text-center font-display text-3xl text-tpl-accent">Venue</h3>
              <VenueBlock
                data={data}
                mutedClassName="text-tpl-muted"
                buttonClassName="bg-tpl-accent text-tpl-bg"
              />
            </Reveal>
          </section>

          <section className="px-7 pt-16 text-center">
            <Reveal>
              <div className="mx-auto max-w-xs rounded-[1.75rem] border border-tpl-accent/35 px-6 py-8">
                <p className="text-sm leading-relaxed text-tpl-muted">
                  {data.message || "We look forward to celebrating this new beginning with you."}
                </p>
                <p className="mt-5 font-display text-2xl italic text-tpl-accent">
                  {data.blessing || "Blessings and love"}
                </p>
              </div>
            </Reveal>
          </section>
        </main>
      </CoverGate>
    </div>
  );
}
