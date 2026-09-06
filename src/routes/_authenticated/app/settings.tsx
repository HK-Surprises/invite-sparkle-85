import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { myCustomerQuery, myProfileQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Account settings — InviteHub" }, { name: "description", content: "Manage your profile and security." }, { property: "og:title", content: "Account settings — InviteHub" }, { property: "og:description", content: "Manage your profile and security." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const profile = useQuery(myProfileQuery);
  const customer = useQuery(myCustomerQuery);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    if (profile.data?.profile) {
      setName(profile.data.profile.full_name);
      setMobile(profile.data.profile.mobile ?? "");
    }
  }, [profile.data]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").upsert({ id: auth.user.id, full_name: name.trim(), mobile: mobile.trim() || null });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Couldn't save your profile. Please try again."),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Password updated.");
      setPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Account settings" description="Manage your profile, preferences and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card-elevated space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(); }}>
          <h2 className="font-display text-2xl">Profile</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={30} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.data?.email ?? ""} disabled />
          </div>
          <Button type="submit" disabled={saveProfile.isPending}>
            {saveProfile.isPending && <Loader2 className="animate-spin" />} Save profile
          </Button>
        </form>

        <div className="space-y-6">
          <form className="card-elevated space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }}>
            <h2 className="font-display text-2xl">Password & security</h2>
            <div className="space-y-2">
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <Button type="submit" variant="outline" disabled={changePassword.isPending || password.length < 8}>
              Update password
            </Button>
          </form>

          <section className="card-elevated space-y-4 p-6">
            <h2 className="font-display text-2xl">Notifications</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email me when a guest opens their invitation</p>
                <p className="text-xs text-muted-foreground">Basic preference — stored on this device for now.</p>
              </div>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </div>
          </section>
        </div>

        <section className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-2xl">Plan & access</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">These are managed by InviteHub. Contact support to make changes.</p>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-muted/60 p-4"><dt className="text-muted-foreground">Invitation limit</dt><dd className="font-display text-2xl">{customer.data?.invitation_limit ?? "—"}</dd></div>
            <div className="rounded-xl bg-muted/60 p-4"><dt className="text-muted-foreground">Used</dt><dd className="font-display text-2xl">{customer.data?.usage?.used ?? 0}</dd></div>
            <div className="rounded-xl bg-muted/60 p-4"><dt className="text-muted-foreground">Access from</dt><dd className="font-display text-2xl">{formatDate(customer.data?.start_date)}</dd></div>
            <div className="rounded-xl bg-muted/60 p-4"><dt className="text-muted-foreground">Access until</dt><dd className="font-display text-2xl">{formatDate(customer.data?.end_date)}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}
