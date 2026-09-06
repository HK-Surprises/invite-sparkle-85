import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/shared/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { fetchRole, homeForRole } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — InviteHub" },
      { name: "description", content: "Sign in to manage your personalized digital invitations." },
      { property: "og:title", content: "Sign in — InviteHub" },
      { property: "og:description", content: "Sign in to manage your personalized digital invitations." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) navigate({ to: homeForRole(await fetchRole(data.user.id)), replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setLoading(false);
      toast.error("We couldn't sign you in. Please check your email and password.");
      return;
    }
    const role = await fetchRole(data.user.id);
    setLoading(false);
    navigate({ to: homeForRole(role), replace: true });
  }

  return (
    <div className="grid min-h-screen bg-hero-glow lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <BrandMark />
        <div className="hidden lg:block">
          <p className="font-display text-5xl leading-tight">
            “Every guest receives
            <br />a unique, personal invitation.”
          </p>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sign in to manage your invitations, add guests and share their personal links.
          </p>
        </div>
        <p className="hidden text-xs text-muted-foreground lg:block">© {new Date().getFullYear()} InviteHub</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="card-elevated w-full max-w-md space-y-5 p-8 shadow-card">
          <div>
            <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with the account provided to you.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Sign in
          </Button>
          <div className="rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo accounts</p>
            <p className="mt-1">Admin: admin@invitehub.demo / Admin@12345</p>
            <p>Customer: rahul@invitehub.demo / Rahul@12345</p>
          </div>
        </form>
      </div>
    </div>
  );
}
