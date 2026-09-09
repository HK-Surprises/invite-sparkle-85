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

/** Template 02 — Rose Gold Blush: romantic rose gold, blush and cream. */
export function RoseGoldBlush({ data, guestName, peopleCount }: TemplateRenderProps) {
  const events = parseEvents(data.events);
  const gallery = parseGallery(data.galleryUrls);
  const couple = [data.groomName, data.brideName].filter(Boolean);

  return (
    <div className="tpl-rosegold min-h-full w-full bg-tpl-bg font-sans text-tpl-fg">
      <CoverGate
        cover={(opening, open) => (
          <div className="relative flex h-full min-h-full items-center justify-center overflow-hidden px-6"
            style={{
              backgroundImage:
                "radial-gradient(70% 50% at 50% 0%, oklch(0.94 0.05 25) 0%, transparent 65%), radial-gradient(60% 45% at 20% 100%, oklch(0.95 0.035 60) 0%, transparent 60%)",
            }}
          >
            <Floaters items={["❀", "✿", "❁", "❀", "✿", "❁", "❀"]} className="text-tpl-accent/45" />
            {/* Card that lifts and opens */}
            <div
              className="relative z-10 w-full max-w-xs rounded-[2rem] border border-tpl-accent/35 bg-tpl-surface/90 px-7 py-12 text-center shadow-float transition-all duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{
                transform: opening ? "translateY(-12%) scale(1.35) rotateX(22deg)" : "none",
                opacity: opening ? 0 : 1,
              }}
            >
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-tpl-accent">Save the date</p>
              <h1 className="mt-5 font-display text-5xl leading-tight text-tpl-fg">
                {couple.join(" & ") || "Our Wedding"}
              </h1>
              <div className="mx-auto mt-5 h-px w-16 bg-tpl-accent/60" />
              <p className="mt-4 text-xs uppercase tracking-[0.28em] text-tpl-muted">Especially for {guestName}</p>
              <button
                type="button"
                onClick={open}
                className="mt-9 rounded-full bg-tpl-accent px-8 py-3 text-[0.65rem] uppercase tracking-[0.3em] text-tpl-surface transition-transform duration-300 hover:scale-105"
              >
                Open invitation
              </button>
            </div>
          </div>
        )}
      >
        <main className="relative overflow-hidden pb-16">
          <Floaters items={["❀", "✿", "❁", "❀", "✿"]} className="text-tpl-accent/25" />

          <section className="relative px-7 pt-14 text-center">
            <Reveal>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-tpl-accent">Together with our families</p>
              <p className="mt-4 font-display text-3xl italic text-tpl-accent">
                Dear {guestGreetingLine(guestName, peopleCount)},
              </p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-tpl-muted">
                We would love for you to join us as we say "forever".
              </p>
            </Reveal>
          </section>

          <section className="px-7 pt-10 text-center">
            <Reveal delay={100}>
              <div className="relative mx-auto max-w-sm rounded-[2.25rem] bg-tpl-surface px-6 py-11 shadow-float">
                <h2 className="font-display text-5xl leading-[1.08]">
                  {data.groomName}
                  {data.brideName && (
                    <>
                      <span className="mx-2 text-tpl-accent">&</span>
                      {data.brideName}
                    </>
                  )}
                </h2>
                <div className="mx-auto mt-5 h-px w-20 bg-tpl-accent/50" />
                <DateLine data={data} className="mt-4 text-xs uppercase tracking-[0.28em] text-tpl-muted" />
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
                Until we celebrate
              </p>
              <Countdown data={data} boxClassName="bg-tpl-surface shadow-soft" labelClassName="text-tpl-muted" />
            </Reveal>
          </section>

          {events.length > 0 && (
            <section className="px-7 pt-16">
              <Reveal>
                <h3 className="mb-5 text-center font-display text-3xl">Celebrations</h3>
              </Reveal>
              <EventsList
                events={events}
                itemClassName="bg-tpl-surface shadow-soft"
                accentClassName="text-tpl-accent"
                mutedClassName="text-tpl-muted"
              />
            </section>
          )}

          {(data.story || gallery.length > 0) && (
            <section className="px-7 pt-16">
              <Reveal>
                <h3 className="mb-4 text-center font-display text-3xl">Our journey</h3>
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
              <h3 className="mb-4 text-center font-display text-3xl">Where</h3>
              <VenueBlock
                data={data}
                mutedClassName="text-tpl-muted"
                buttonClassName="bg-tpl-accent text-tpl-surface"
              />
            </Reveal>
          </section>

          <section className="px-7 pt-16 text-center">
            <Reveal>
              <div className="mx-auto max-w-xs rounded-[2rem] bg-tpl-surface px-6 py-9 shadow-soft">
                <p className="text-sm leading-relaxed text-tpl-muted">
                  {data.message || "Your love and blessings would mean the world to us."}
                </p>
                <p className="mt-5 font-display text-2xl italic text-tpl-accent">
                  {data.blessing || "With love and gratitude"}
                </p>
              </div>
            </Reveal>
          </section>
        </main>
      </CoverGate>
    </div>
  );
}
