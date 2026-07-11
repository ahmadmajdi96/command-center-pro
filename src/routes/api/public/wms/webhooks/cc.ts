import { createFileRoute } from "@tanstack/react-router";

// Webhook from Command Center Pro: pushes orders that must be fulfilled by the WMS.
export const Route = createFileRoute("/api/public/wms/webhooks/cc")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { adminClient, verifySecret, json } = await import("@/lib/integrations.server");
        const check = verifySecret(request);
        if (!check.ok) return check.response;
        let body: any;
        try { body = await request.json(); } catch { return json({ error: "invalid json" }, { status: 400 }); }
        const orders: any[] = Array.isArray(body) ? body : Array.isArray(body?.orders) ? body.orders : [body];
        const supabase = adminClient();
        let reconciled = 0;
        for (const o of orders) {
          if (!o?.external_id || !o?.order_number) continue;
          await supabase.from("cc_orders").upsert({
            external_id: String(o.external_id),
            order_number: String(o.order_number),
            customer: o.customer ?? null,
            status: o.status ?? "received",
            total: o.total ?? null,
            raw: o,
          }, { onConflict: "external_id" });
          await supabase.from("integration_events").insert({
            system: "command_center", event_type: "order", external_id: String(o.external_id),
            payload: o, status: "processed", processed_at: new Date().toISOString(),
          });
          reconciled++;
        }
        return json({ ok: true, reconciled });
      },
    },
  },
});
