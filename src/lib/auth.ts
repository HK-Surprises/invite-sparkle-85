import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types";

export async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

export function homeForRole(role: AppRole | null): "/admin/dashboard" | "/app/dashboard" {
  return role === "super_admin" ? "/admin/dashboard" : "/app/dashboard";
}

export async function signOut() {
  await supabase.auth.signOut();
}
