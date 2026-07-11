import { createFileRoute } from "@tanstack/react-router";

// Webhook from CORTA QC System: pushes inspection results and creates quality holds when needed.
export const Route = createFileRoute("/api/public/wms/webhooks/qc")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { adminClient, verifySecret, json } = await import("@/lib/integrations.server");
        const check = verifySecret(request);
        if (!check.ok) return check.response;
        let body: any;
        try { body = await request.json(); } catch { return json({ error: "invalid json" }, { status: 400 }); }
        const inspections: any[] = Array.isArray(body) ? body : Array.isArray(body?.inspections) ? body.inspections : [body];
        const supabase = adminClient();
        let reconciled = 0;
        for (const insp of inspections) {
          if (!insp?.external_id) continue;
          const { error: upErr } = await supabase.from("qc_inspections").upsert({
            external_id: String(insp.external_id),
            product_id: insp.product_id ?? null,
            lot: insp.lot ?? null,
            result: String(insp.result ?? "unknown"),
            inspector: insp.inspector ?? null,
            inspected_at: insp.inspected_at ?? new Date().toISOString(),
            notes: insp.notes ?? null,
          }, { onConflict: "external_id" });
          if (upErr) continue;
          if (String(insp.result).toLowerCase() === "fail" || String(insp.result).toLowerCase() === "reject") {
            await supabase.from("quality_holds").insert({
              reference: `QCH-${insp.external_id}`.slice(0, 40),
              product_id: insp.product_id ?? null,
              lot: insp.lot ?? null,
              quantity: insp.quantity ?? 0,
              reason: insp.reason ?? `QC failed inspection ${insp.external_id}`,
              severity: insp.severity ?? "high",
              qc_source: "corta_qc_system",
              external_ref: String(insp.external_id),
            }).select().maybeSingle();
          }
          await supabase.from("integration_events").insert({
            system: "qc_system", event_type: "inspection", external_id: String(insp.external_id),
            payload: insp, status: "processed", processed_at: new Date().toISOString(),
          });
          reconciled++;
        }
        return json({ ok: true, reconciled });
      },
    },
  },
});
