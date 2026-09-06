import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, Message, Ornament, TemplateFrame } from "./shared";

export function ReligiousCelebration01({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-religious" className="items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-[2rem] border-4 border-double border-tpl-accent/50 bg-tpl-surface px-8 py-12 text-center shadow-float">
        <svg className="mx-auto h-12 w-12 text-tpl-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M12 3c1.5 2.5 2.5 4.5 2.5 6.5a2.5 2.5 0 01-5 0C9.5 7.5 10.5 5.5 12 3z" />
          <path d="M5 15h14l-1.5 4h-11z" /><path d="M8 13h8" />
        </svg>
        <p className="mt-4 text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">|| Shubh Mangal ||</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">{data.primaryName || "Religious Celebration"}</h1>
        {data.hostNote && <p className="mt-2 font-display text-lg italic text-tpl-muted">hosted by {data.hostNote}</p>}
        <Ornament className="my-5" />
        <Greeting guestName={guestName} className="text-3xl" />
        <Message data={data} fallback="We humbly invite you to join us and seek divine blessings together." className="mt-3" />
        <Details data={data} className="mt-8" />
      </div>
    </TemplateFrame>
  );
}
