import type { TemplateRenderProps } from "@/types";
import { Details, Greeting, HostNote, Message, Names, Ornament, TemplateFrame } from "./shared";

export function WeddingElegant03({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-elegant" className="items-center justify-center p-5">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-tpl-surface px-8 py-12 text-center shadow-float">
        <svg className="absolute -top-8 -left-8 h-40 w-40 text-tpl-accent/25" viewBox="0 0 100 100" fill="currentColor" aria-hidden>
          <circle cx="30" cy="30" r="14" /><circle cx="52" cy="22" r="9" /><circle cx="22" cy="54" r="9" /><circle cx="46" cy="46" r="6" />
        </svg>
        <svg className="absolute -right-8 -bottom-8 h-40 w-40 text-tpl-accent/25" viewBox="0 0 100 100" fill="currentColor" aria-hidden>
          <circle cx="70" cy="70" r="14" /><circle cx="48" cy="78" r="9" /><circle cx="78" cy="46" r="9" /><circle cx="54" cy="54" r="6" />
        </svg>
        <p className="font-display text-sm italic text-tpl-muted">Together with their families</p>
        <Names data={data} className="mt-4 text-5xl" />
        <Ornament className="my-5" />
        <p className="text-xs uppercase tracking-[0.25em] text-tpl-muted">request the pleasure of your company</p>
        <Greeting guestName={guestName} className="mt-6 text-3xl" />
        <Message data={data} fallback="Your blessings and presence will make this celebration complete." className="mt-3" />
        <Details data={data} className="mt-8" />
        <HostNote data={data} className="mt-8" />
      </div>
    </TemplateFrame>
  );
}
