import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { platformSettingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — InviteHub Admin" }, { name: "description", content: "Platform settings." }, { property: "og:title", content: "Settings — InviteHub Admin" }, { property: "og:description", content: "Platform settings." }] }),
  component: AdminSettingsPage,
});

const defaults = { platform_name: "InviteHub", support_email: "", support_phone: "", timezone: "Asia/Kolkata", default_language: "en", maintenance_mode: false };

function AdminSettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery(platformSettingsQuery);
  const [v, setV] = useState(defaults);
  useEffect(() => { if (settings.data) setV({ ...defaults, ...settings.data }); }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("platform_settings").upsert({ key: "general", value: v }); if (error) throw new Error(error.message); },
    onSuccess: () => { toast.success("Settings saved."); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: () => toast.error("Couldn't save settings."),
  });

  const field = (k: keyof typeof defaults, label: string, type = "text") => (
    <div className="space-y-2"><Label htmlFor={k}>{label}</Label><Input id={k} type={type} value={String(v[k] ?? "")} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>
  );

  return (
    <div>
      <PageHeader title="Settings" description="General, branding, notifications, security and system settings." actions={<Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save changes</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-elevated space-y-4 p-6"><h2 className="font-display text-2xl">General & branding</h2>{field("platform_name", "Platform name")}{field("timezone", "Timezone")}{field("default_language", "Default language")}<p className="text-xs text-muted-foreground">Logo upload arrives in a later version.</p></section>
        <section className="card-elevated space-y-4 p-6"><h2 className="font-display text-2xl">Support & notifications</h2>{field("support_email", "Support email", "email")}{field("support_phone", "Support phone")}</section>
        <section className="card-elevated space-y-3 p-6"><h2 className="font-display text-2xl">Security</h2><p className="text-sm text-muted-foreground">Roles are enforced on the server. Customers can never change their own limits, templates or dates. Invitation links use unguessable 10-character tokens.</p></section>
        <section className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-display text-2xl text-destructive">Danger zone</h2>
          <div className="mt-4 flex items-center justify-between">
            <div><p className="text-sm font-medium">Maintenance mode</p><p className="text-xs text-muted-foreground">Flag stored in settings for future use.</p></div>
            <Switch checked={!!v.maintenance_mode} onCheckedChange={(c) => setV({ ...v, maintenance_mode: c })} />
          </div>
        </section>
      </div>
    </div>
  );
}
