import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const tones = {
  lavender: "bg-lavender text-lavender-foreground",
  peach: "bg-peach text-peach-foreground",
  rose: "bg-rose text-rose-foreground",
  sage: "bg-sage text-sage-foreground",
  sky: "bg-sky text-sky-foreground",
};

export function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "lavender",
  loading,
  className,
}: {
  label: string;
  value: string | number | undefined;
  hint?: string | undefined;
  icon?: LucideIcon | undefined;
  tone?: keyof typeof tones | undefined;
  loading?: boolean | undefined;
  className?: string;
}) {
  return (
    <div className={cn("card-elevated flex items-start gap-4 p-5", className)}>
      {Icon && (
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-20" />
        ) : (
          <p className="mt-1 font-display text-3xl font-semibold leading-none">{value ?? "—"}</p>
        )}
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
