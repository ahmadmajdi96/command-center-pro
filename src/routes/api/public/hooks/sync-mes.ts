import { createFileRoute } from "@tanstack/react-router";

async function handler() {
  const { adminClient, json } = await import("@/lib/integrations.server");
  const { runSync } = await import("@/lib/sync.server");
  try {
    const result = await runSync("mes", adminClient());
    return json({ ok: true, system: "mes", ...result });
  } catch (e) { return json({ ok: false, error: String(e) }, { status: 500 }); }
}

export const Route = createFileRoute("/api/public/hooks/sync-mes")({
  server: { handlers: { GET: handler, POST: handler } },
});
