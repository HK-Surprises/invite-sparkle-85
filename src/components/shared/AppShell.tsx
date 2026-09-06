import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Sparkles, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function BrandMark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Sparkles className="h-4.5 w-4.5" />
      </span>
      {!compact && <span className="font-display text-2xl font-semibold tracking-tight">InviteHub</span>}
    </Link>
  );
}

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft" }}
        >
          <Icon className="h-4.5 w-4.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  variant,
  items,
  userName,
  userSubtitle,
  children,
  sidebarFooter,
}: {
  variant: "admin" | "customer";
  items: NavItem[];
  userName: string;
  userSubtitle?: string | undefined;
  children: ReactNode;
  sidebarFooter?: ReactNode | undefined;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <BrandMark />
        <p className="mt-1.5 pl-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {variant === "admin" ? "Admin console" : "Your invitations"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <NavLinks items={items} onNavigate={() => setOpen(false)} />
        {sidebarFooter && <div className="mt-6 px-1">{sidebarFooter}</div>}
      </div>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-sm font-semibold text-lavender-foreground">
            {initials(userName || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            {userSubtitle && <p className="truncate text-xs text-muted-foreground">{userSubtitle}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen", variant === "customer" && "bg-customer-glow")}>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
          <BrandMark compact />
          <span className="font-display text-xl">InviteHub</span>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
