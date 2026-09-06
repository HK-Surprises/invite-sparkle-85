import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InvitationPreview } from "./InvitationPreview";
import { sampleDataFor } from "@/templates/registry";
import { StatusBadge } from "./StatusBadge";

export function TemplateCard({
  name,
  categoryName,
  componentKey,
  description,
  isActive,
  footer,
  meta,
  className,
  selected,
}: {
  name: string;
  categoryName?: string | null | undefined;
  componentKey: string;
  description?: string | null | undefined;
  isActive?: boolean | undefined;
  footer?: ReactNode;
  meta?: ReactNode;
  className?: string;
  selected?: boolean;
}) {
  const sample = sampleDataFor(componentKey);
  return (
    <div className={cn("card-elevated group flex flex-col overflow-hidden transition-shadow hover:shadow-card", selected && "ring-2 ring-primary", className)}>
      <div className="relative bg-muted/60 p-4 pb-0">
        <div className="pointer-events-none overflow-hidden rounded-t-2xl">
          <InvitationPreview componentKey={componentKey} title={sample.title} data={sample.data} guestName="Amit" frame={false} className="max-h-64" />
        </div>
        {isActive === false && (
          <div className="absolute top-3 right-3">
            <StatusBadge status="inactive" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl leading-tight">{name}</h3>
            {meta}
          </div>
          {categoryName && <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-primary">{categoryName}</p>}
          {description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        {footer && <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">{footer}</div>}
      </div>
    </div>
  );
}
