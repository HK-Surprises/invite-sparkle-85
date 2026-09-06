import type { TemplateRenderProps } from "@/types";
import { formatDate } from "@/lib/format";
import { Greeting, HostNote, Message, Names, TemplateFrame } from "./shared";

export function WeddingMinimal04({ data, guestName }: TemplateRenderProps) {
  return (
    <TemplateFrame theme="tpl-minimal" className="justify-between px-9 py-14">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-tpl-muted">{formatDate(data.eventDate, "dd . MM . yyyy")}</p>
        <Names data={data} className="mt-10 text-6xl font-light" />
      </div>
      <div className="space-y-6">
        <div className="h-px w-full bg-tpl-accent/40" />
        <Greeting guestName={guestName} className="not-italic text-xl text-tpl-fg" />
        <Message data={data} fallback="We are getting married, and it would mean the world to have you there." className="mx-0 text-left" />
        <div className="space-y-1 text-sm">
          {data.eventTime && <p>{data.eventTime}</p>}
          {data.venueName && <p className="font-medium">{data.venueName}</p>}
          {data.city && <p className="text-tpl-muted">{data.city}</p>}
        </div>
        <HostNote data={data} />
      </div>
    </TemplateFrame>
  );
}
