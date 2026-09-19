import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, HostNote, Message, Names, Ornament, TemplateFrame } from "./shared";

export function WeddingTraditional01({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-traditional" className="items-center justify-center p-4">
      <div className="floral-corner relative w-full max-w-sm rounded-[1.75rem] border border-tpl-accent/50 bg-tpl-surface px-7 py-10 text-center shadow-float">
        <div className="absolute inset-2 rounded-[1.4rem] border border-tpl-accent/40" aria-hidden />
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-tpl-accent">|| Shubh Vivah ||</p>
        <Ornament className="my-4" />
        <Greeting guestName={guestName} />
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-tpl-muted">You are cordially invited to the wedding of</p>
        <Names data={data} className="mt-4 text-5xl" />
        <Ornament className="my-6" />
        <Details data={data} />
        <Message data={data} fallback="Your presence would make our special day even more meaningful." className="mt-6" />
        <HostNote data={data} className="mt-6" />
      </div>
    </TemplateFrame>
  );
}
