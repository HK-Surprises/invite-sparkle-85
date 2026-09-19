import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, HostNote, Message, Names, TemplateFrame } from "./shared";

export function EngagementElegant01({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-engagement" className="items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-[2rem] bg-tpl-surface px-8 py-12 text-center shadow-float">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tpl-accent-soft text-tpl-accent" aria-hidden>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="12" cy="14" r="6" /><path d="M9 8l3-4 3 4" />
          </svg>
        </div>
        <p className="mt-5 text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">She said yes</p>
        <Names data={data} className="mt-4 text-5xl" />
        <p className="mt-3 font-display text-lg italic text-tpl-muted">are getting engaged</p>
        <Greeting guestName={guestName} className="mt-8 text-3xl" />
        <Message data={data} fallback="Join us for the ring ceremony and shower the couple with your blessings." className="mt-3" />
        <Details data={data} className="mt-8" />
        <HostNote data={data} className="mt-8" />
      </div>
    </TemplateFrame>
  );
}
