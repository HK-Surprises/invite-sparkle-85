import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-sage text-sage-foreground",
  inactive: "bg-muted text-muted-foreground",
  draft: "bg-peach text-peach-foreground",
  opened: "bg-sage text-sage-foreground",
  not_opened: "bg-lavender text-lavender-foreground",
  expired: "bg-rose text-rose-foreground",
  sent: "bg-sky text-sky-foreground",
  pending: "bg-peach text-peach-foreground",
};

const labels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
  opened: "Opened",
  not_opened: "Not opened",
  expired: "Expired",
  sent: "Sent",
  pending: "Pending",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {labels[status] ?? status}
    </span>
  );
}
