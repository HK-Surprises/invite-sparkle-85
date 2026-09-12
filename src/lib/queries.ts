import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Customer, CustomerUsage, Guest, Invitation, Profile, Template } from "@/types";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ---------- Customer side ---------- */

export const myCustomerQuery = queryOptions({
  queryKey: ["me", "customer"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return null;
    const customer = unwrap(
      await supabase.from("customers").select("*").eq("user_id", uid).maybeSingle(),
    ) as Customer | null;
    if (!customer) return null;
    const usage = unwrap(
      await supabase.from("customer_usage").select("*").eq("customer_id", customer.id).maybeSingle(),
    ) as CustomerUsage | null;
    return { ...customer, usage };
  },
});

export const myProfileQuery = queryOptions({
  queryKey: ["me", "profile"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return null;
    const profile = unwrap(await supabase.from("profiles").select("*").eq("id", uid).maybeSingle()) as Profile | null;
    return { profile, email: auth.user?.email ?? "" };
  },
});

export const myTemplatesQuery = queryOptions({
  queryKey: ["me", "templates"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("templates")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("name"),
    ) as (Template & { categories: { name: string; slug: string } | null })[],
});

export const customerCategoriesQuery = queryOptions({
  queryKey: ["me", "template-categories"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("name"),
    ) as Category[],
});

export const myInvitationsQuery = queryOptions({
  queryKey: ["me", "invitations"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("invitations")
        .select("*, templates(name, component_key, categories(name))")
        .order("created_at", { ascending: false }),
    ) as (Invitation & {
      templates: { name: string; component_key: string; categories: { name: string } | null } | null;
    })[],
});

export const myGuestsQuery = (invitationId?: string) =>
  queryOptions({
    queryKey: ["me", "guests", invitationId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("guests").select("*").order("created_at", { ascending: false });
      if (invitationId) q = q.eq("invitation_id", invitationId);
      return unwrap(await q) as Guest[];
    },
  });

/* ---------- Admin side ---------- */

export const adminCustomersQuery = queryOptions({
  queryKey: ["admin", "customers"],
  queryFn: async () => {
    const customers = unwrap(
      await supabase.from("customers").select("*").order("created_at", { ascending: false }),
    ) as Customer[];
    const usage = unwrap(await supabase.from("customer_usage").select("*")) as CustomerUsage[];
    const byId = new Map(usage.map((u) => [u.customer_id, u]));
    return customers.map((c) => ({ ...c, usage: byId.get(c.id) ?? null }));
  },
});

export const adminCustomerQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "customers", id],
    queryFn: async () => {
      const customer = unwrap(
        await supabase.from("customers").select("*").eq("id", id).maybeSingle(),
      ) as Customer | null;
      if (!customer) return null;
      const [usage, access, invitations] = await Promise.all([
        supabase.from("customer_usage").select("*").eq("customer_id", id).maybeSingle(),
        supabase.from("customer_template_access").select("template_id").eq("customer_id", id),
        supabase
          .from("invitations")
          .select("*, templates(name)")
          .eq("customer_id", id)
          .order("created_at", { ascending: false }),
      ]);
      return {
        ...customer,
        usage: unwrap(usage) as CustomerUsage | null,
        templateIds: (unwrap(access) as { template_id: string }[]).map((a) => a.template_id),
        invitations: unwrap(invitations) as (Invitation & { templates: { name: string } | null })[],
      };
    },
  });

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    unwrap(await supabase.from("categories").select("*").order("sort_order")) as Category[],
});

export const adminTemplatesQuery = queryOptions({
  queryKey: ["admin", "templates"],
  queryFn: async () =>
    unwrap(
      await supabase.from("templates").select("*, categories(name, slug)").order("created_at"),
    ) as (Template & { categories: { name: string; slug: string } | null })[],
});

export const adminInvitationsQuery = queryOptions({
  queryKey: ["admin", "invitations"],
  queryFn: async () => {
    const invitations = unwrap(
      await supabase
        .from("invitations")
        .select("*, customers(name, start_date, end_date, status), templates(name, categories(name))")
        .order("created_at", { ascending: false }),
    ) as (Invitation & {
      customers: { name: string; start_date: string | null; end_date: string | null; status: string } | null;
      templates: { name: string; categories: { name: string } | null } | null;
    })[];
    const guests = unwrap(await supabase.from("guests").select("invitation_id, status")) as {
      invitation_id: string;
      status: string;
    }[];
    return invitations.map((i) => {
      const g = guests.filter((x) => x.invitation_id === i.id);
      return { ...i, guestCount: g.length, openedCount: g.filter((x) => x.status === "opened").length };
    });
  },
});

export const adminGuestsQuery = queryOptions({
  queryKey: ["admin", "guests"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("guests")
        .select("id, name, status, created_at, last_viewed_at, invitation_id"),
    ) as Pick<Guest, "id" | "name" | "status" | "created_at" | "last_viewed_at" | "invitation_id">[],
});

export const adminViewsQuery = queryOptions({
  queryKey: ["admin", "views"],
  queryFn: async () =>
    unwrap(await supabase.from("invitation_views").select("id, viewed_at, guest_id")) as {
      id: string;
      viewed_at: string;
      guest_id: string;
    }[],
});

export const platformSettingsQuery = queryOptions({
  queryKey: ["settings", "general"],
  queryFn: async () => {
    const row = unwrap(
      await supabase.from("platform_settings").select("value").eq("key", "general").maybeSingle(),
    ) as { value: Record<string, unknown> } | null;
    return (row?.value ?? {}) as {
      platform_name?: string;
      support_email?: string;
      support_phone?: string;
      timezone?: string;
      default_language?: string;
      maintenance_mode?: boolean;
    };
  },
});
