import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, Message, TemplateFrame } from "./shared";

export function HousewarmingNewHome01({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-housewarming" className="items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-[2rem] bg-tpl-surface px-8 py-12 text-center shadow-float">
        <svg className="mx-auto h-14 w-14 text-tpl-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" />
        </svg>
        <p className="mt-5 text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">Griha Pravesh</p>
        <h1 className="mt-4 font-display text-4xl leading-tight">{data.primaryName || "Our new home"}</h1>
        <p className="mt-2 font-display text-lg italic text-tpl-muted">warmly invite you to bless their new home</p>
        <Greeting guestName={guestName} className="mt-8 text-3xl" />
        <Message data={data} fallback="Your presence and blessings will fill our new home with happiness." className="mt-3" />
        <Details data={data} className="mt-8" />
      </div>
    </TemplateFrame>
  );
}
