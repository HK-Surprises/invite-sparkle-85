import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, HostNote, Message, TemplateFrame } from "./shared";

export function BirthdayCelebration01({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-birthday" className="items-center justify-center p-5">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-tpl-surface px-8 py-12 text-center shadow-float">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {[12, 30, 52, 70, 88].map((x, i) => (
            <span key={x} className="absolute h-2 w-2 rounded-full bg-tpl-accent/50" style={{ left: `${x}%`, top: `${8 + (i % 3) * 6}%` }} />
          ))}
        </div>
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">You're invited</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">{data.primaryName || "Birthday"}</h1>
        {data.milestone && (
          <p className="mt-2 font-display text-2xl italic text-tpl-muted">is turning {data.milestone}</p>
        )}
        <Greeting guestName={guestName} className="mt-8 text-3xl" />
        <Message data={data} fallback="Come celebrate with cake, laughter and lots of love." className="mt-3" />
        <Details data={data} className="mt-8" />
        <HostNote data={data} className="mt-8" />
      </div>
    </TemplateFrame>
  );
}
