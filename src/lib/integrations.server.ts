import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function adminClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function verifySecret(request: Request): { ok: true } | { ok: false; response: Response } {
  const expected = process.env.CORTA_INTEGRATION_SECRET;
  if (!expected) return { ok: true }; // fail-open in dev if unset
  const provided = request.headers.get("x-corta-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!provided || provided !== expected) {
    return { ok: false, response: new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } }) };
  }
  return { ok: true };
}

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
}
