import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { ResolvedInvitation } from "@/types";

const tokenSchema = z.object({ token: z.string().min(6).max(40).regex(/^[A-Za-z0-9]+$/) });

/**
 * Public resolution of a guest token. All validation (customer status,
 * invitation status, start/end dates) happens inside the database routine;
 * the caller only ever receives the minimal data needed to render the card.
 */
export const resolveInvitation = createServerFn({ method: "GET" })
  .inputValidator((input: { token: string }) => {
    const parsed = tokenSchema.safeParse(input);
    return parsed.success ? parsed.data : { token: "" };
  })
  .handler(async ({ data }): Promise<ResolvedInvitation> => {
    if (!data.token) return { state: "not_found" };
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return { state: "not_found" };

    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: result, error } = await client.rpc("resolve_invitation", {
      _token: data.token,
      _record_view: true,
    });
    if (error) {
      console.error("resolve_invitation failed", error.message);
      throw new Error("We couldn't load this invitation. Please try again.");
    }
    return result as unknown as ResolvedInvitation;
  });
