import { createFileRoute } from "@tanstack/react-router";
async function handler() {
  const { adminClient, json } = await import("@/lib/integrations.server");
  const { runSync } = await import("@/lib/sync.server");
  try {
    const supabase = adminClient();
    const results = await Promise.allSettled([
      runSync("mes", supabase), runSync("qms", supabase),
      runSync("oms", supabase), runSync("cmms", supabase),
    ]);
    return json({ ok: true, results: results.map((r) => r.status === "fulfilled" ? r.value : { error: String(r.reason) }) });
  } catch (e) { return json({ ok: false, error: String(e) }, { status: 500 }); }
}
export const Route = createFileRoute("/api/public/hooks/sync-all")({
  server: { handlers: { GET: handler, POST: handler } },
});
