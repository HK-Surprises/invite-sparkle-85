import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, HostNote, Message, Names, TemplateFrame } from "./shared";

export function WeddingModern02({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-modern">
      <div className="flex-1 px-8 pt-14 pb-8">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">Save the date</p>
        <Names data={data} joiner="+" className="mt-6 text-6xl" />
        <div className="my-8 h-px w-16 bg-tpl-accent" />
        <Greeting guestName={guestName} className="not-italic text-xl" />
        <Message data={data} fallback="We would be honoured to have you celebrate with us as we begin our life together." className="mx-0 mt-3 text-left" />
      </div>
      <div className="rounded-t-[2rem] bg-tpl-surface px-8 py-8 shadow-float">
        <Details data={data} className="text-left [&_dd]:text-left [&_dt]:text-left" />
        <HostNote data={data} className="mt-6" />
      </div>
    </TemplateFrame>
  );
}
