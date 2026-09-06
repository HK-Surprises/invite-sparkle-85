import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminTemplatesQuery } from "@/lib/queries";

export interface CustomerFormValues {
  name: string;
  email: string;
  password: string;
  mobile: string;
  status: "active" | "inactive";
  invitation_limit: number;
  start_date: string;
  end_date: string;
  notes: string;
  template_ids: string[];
}

export const emptyCustomer: CustomerFormValues = {
  name: "",
  email: "",
  password: "",
  mobile: "",
  status: "active",
  invitation_limit: 100,
  start_date: "",
  end_date: "",
  notes: "",
  template_ids: [],
};

export function CustomerForm({
  initial,
  mode,
  onSubmit,
  submitting,
  extra,
}: {
  initial: CustomerFormValues;
  mode: "create" | "edit";
  onSubmit: (values: CustomerFormValues) => void;
  submitting?: boolean;
  extra?: ReactNode;
}) {
  const [v, setV] = useState(initial);
  const templates = useQuery(adminTemplatesQuery);
  const set = <K extends keyof CustomerFormValues>(k: K, val: CustomerFormValues[K]) => setV((s) => ({ ...s, [k]: val }));
  const toggle = (id: string) => set("template_ids", v.template_ids.includes(id) ? v.template_ids.filter((x) => x !== id) : [...v.template_ids, id]);

  const grouped = (templates.data ?? []).reduce<Record<string, typeof templates.data>>((acc, t) => {
    const k = t.categories?.name ?? "Other";
    (acc[k] ??= []).push(t);
    return acc;
  }, {});

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_380px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <div className="space-y-6">
        <section className="card-elevated space-y-4 p-6">
          <h2 className="font-display text-2xl">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Customer name *</Label>
              <Input id="c-name" required maxLength={120} value={v.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email *</Label>
              <Input id="c-email" type="email" required value={v.email} disabled={mode === "edit"} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-mobile">Mobile number</Label>
              <Input id="c-mobile" value={v.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </div>
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="c-pass">Login password *</Label>
                <Input id="c-pass" type="text" required minLength={8} value={v.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 characters" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea id="c-notes" rows={2} maxLength={1000} value={v.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </section>

        <section className="card-elevated space-y-4 p-6">
          <h2 className="font-display text-2xl">Access & limits</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={v.status} onValueChange={(s) => set("status", s as "active" | "inactive")}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-limit">Invitation limit *</Label>
              <Input id="c-limit" type="number" min={0} max={100000} required value={v.invitation_limit} onChange={(e) => set("invitation_limit", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-start">Start date</Label>
              <Input id="c-start" type="date" value={v.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-end">End date</Label>
              <Input id="c-end" type="date" value={v.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
          </div>
        </section>
        {extra}
      </div>

      <div className="space-y-6">
        <section className="card-elevated p-6">
          <h2 className="font-display text-2xl">Allowed templates</h2>
          <p className="mt-1 text-xs text-muted-foreground">{v.template_ids.length} selected</p>
          <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{cat}</p>
                <div className="space-y-2">
                  {list?.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm hover:bg-muted/50">
                      <Checkbox checked={v.template_ids.includes(t.id)} onCheckedChange={() => toggle(t.id)} />
                      <span className="flex-1">{t.name}</span>
                      {!t.is_active && <span className="text-xs text-muted-foreground">inactive</span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {mode === "create" ? "Create customer" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
