import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getTemplateComponent } from "@/templates/registry";
import type { InvitationData } from "@/types";

/**
 * Renders a template inside a phone-shaped frame, scaled to fit its container.
 * The same component is used for gallery thumbnails, the live guest preview
 * and the admin template preview.
 */
export function InvitationPreview({
  componentKey,
  title,
  data,
  guestName,
  peopleCount,
  className,
  frame = true,
}: {
  componentKey: string;
  title: string;
  data: InvitationData;
  guestName: string;
  peopleCount?: number | undefined;
  className?: string | undefined;
  frame?: boolean;
}) {
  const Template = getTemplateComponent(componentKey);
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const BASE_W = 390;
  const BASE_H = 760;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? BASE_W;
      setScale(Math.min(1, w / BASE_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("relative mx-auto w-full", className)} style={{ maxWidth: BASE_W }}>
      <div style={{ height: BASE_H * scale }} className="relative">
        <div
          className={cn(
            "absolute top-0 left-0 origin-top-left overflow-hidden",
            frame && "rounded-[2.2rem] border-[6px] border-foreground/90 shadow-float",
          )}
          style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})` }}
        >
          <div className="h-full w-full overflow-y-auto">
            <Template title={title} data={data} guestName={guestName} peopleCount={peopleCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
