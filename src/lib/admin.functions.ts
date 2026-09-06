import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(72),
  mobile: z.string().trim().max(30).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  invitation_limit: z.number().int().min(0).max(100000),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  template_ids: z.array(z.string().uuid()).max(500),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin, error } = await context.supabase.rpc("is_admin");
  if (error || !isAdmin) throw new Error("Forbidden");
}

/** Admin-only: creates the login + customer record + template access. */
export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateCustomerInput) => createCustomerSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name },
    });
    if (userErr || !created.user) {
      throw new Error(userErr?.message?.includes("already") ? "A login with this email already exists." : "Could not create the customer login.");
    }
    const uid = created.user.id;

    const { error: pErr } = await supabaseAdmin.from("profiles").insert({ id: uid, full_name: data.name, mobile: data.mobile || null });
    if (pErr) throw new Error(pErr.message);
    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({ user_id: uid, role: "customer" });
    if (rErr) throw new Error(rErr.message);

    const { data: customer, error: cErr } = await supabaseAdmin
      .from("customers")
      .insert({
        user_id: uid,
        name: data.name,
        email: data.email,
        mobile: data.mobile || null,
        status: data.status,
        invitation_limit: data.invitation_limit,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        notes: data.notes || null,
      })
      .select("id")
      .single();
    if (cErr || !customer) throw new Error(cErr?.message ?? "Could not save customer.");

    if (data.template_ids.length) {
      const { error: aErr } = await supabaseAdmin
        .from("customer_template_access")
        .insert(data.template_ids.map((template_id) => ({ customer_id: customer.id, template_id })));
      if (aErr) throw new Error(aErr.message);
    }
    return { id: customer.id };
  });

const resetSchema = z.object({ customer_id: z.string().uuid(), password: z.string().min(8).max(72) });

/** Admin-only: set a new password for a customer login. */
export const resetCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof resetSchema>) => resetSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: customer } = await supabaseAdmin.from("customers").select("user_id").eq("id", data.customer_id).maybeSingle();
    if (!customer?.user_id) throw new Error("This customer has no login yet.");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(customer.user_id, { password: data.password });
    if (error) throw new Error("Could not update password.");
    return { ok: true };
  });
