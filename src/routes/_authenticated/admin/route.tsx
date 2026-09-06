import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BarChart3, FolderOpen, LayoutDashboard, LayoutTemplate, Mail, Settings, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/AppShell";

const items: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/invitations", label: "Invitations", icon: Mail },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (context.role !== "super_admin") throw redirect({ to: "/app/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const name = (user.user_metadata?.['full_name'] as string | undefined) ?? "Admin";
  return (
    <AppShell variant="admin" items={items} userName={name} userSubtitle="Super admin">
      <Outlet />
    </AppShell>
  );
}
