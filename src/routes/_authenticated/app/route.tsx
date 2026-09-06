import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, LayoutDashboard, LayoutTemplate, Link2, Mail, Settings, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/AppShell";
import { myCustomerQuery } from "@/lib/queries";
import { Progress } from "@/components/ui/progress";

const items: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/app/invitation", label: "My Invitation", icon: Mail },
  { to: "/app/guests", label: "My Guests", icon: Users },
  { to: "/app/links", label: "Links & Sharing", icon: Link2 },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/app")({
  beforeLoad: ({ context }) => {
    if (context.role === "super_admin") throw redirect({ to: "/admin/dashboard" });
  },
  component: CustomerLayout,
});

function CustomerLayout() {
  const { user } = Route.useRouteContext();
  const { data: customer } = useQuery(myCustomerQuery);
  const name = customer?.name ?? (user.user_metadata?.['full_name'] as string | undefined) ?? "Customer";
  const used = customer?.usage?.used ?? 0;
  const limit = customer?.invitation_limit ?? 0;

  return (
    <AppShell
      variant="customer"
      items={items}
      userName={name}
      userSubtitle={user.email ?? undefined}
      sidebarFooter={
        customer ? (
          <div className="rounded-2xl bg-lavender/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-lavender-foreground">Invitation usage</p>
            <p className="mt-1 font-display text-2xl">
              {used} <span className="text-base text-muted-foreground">/ {limit}</span>
            </p>
            <Progress value={limit ? (used / limit) * 100 : 0} className="mt-2 h-1.5" />
            <p className="mt-2 text-xs text-muted-foreground">{Math.max(limit - used, 0)} remaining</p>
          </div>
        ) : null
      }
    >
      <Outlet />
    </AppShell>
  );
}
