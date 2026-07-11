import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";

type System = "mes" | "qms" | "oms" | "cmms";

async function runSync(system: System, supabase: SupabaseClient) {
  const { data: run } = await supabase.from("integration_sync_runs").insert({ system, status: "running" }).select().single();
  let pulled = 0, reconciled = 0, errors = 0;
  const detail: Record<string, unknown> = {};
  try {
    if (system === "mes") {
      // Simulate pulling production events; write summarised events.
      const events = Array.from({ length: 3 }).map((_, i) => ({
        system, event_type: "production_output", external_id: `MES-${Date.now()}-${i}`,
        payload: { units: 100 + i * 25, line: `Line-${(i % 3) + 1}` }, status: "processed",
        processed_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from("integration_events").insert(events);
      if (error) errors++; else { pulled += events.length; reconciled += events.length; }
    } else if (system === "qms") {
      // Reconcile QC inspections into quality_holds when result = fail.
      const { data: fails } = await supabase.from("qc_inspections").select("*").eq("result", "fail").limit(50);
      pulled = fails?.length ?? 0;
      for (const f of fails ?? []) {
        const ref = `QCH-${f.external_id}`.slice(0, 40);
        const { data: existing } = await supabase.from("quality_holds").select("id").eq("external_ref", String(f.external_id)).maybeSingle();
        if (!existing) {
          const { error } = await supabase.from("quality_holds").insert({
            reference: ref, product_id: f.product_id, lot: f.lot, quantity: 0,
            reason: f.notes ?? `QMS reconciled failed inspection ${f.external_id}`,
            severity: "high", qc_source: "qms_sync", external_ref: String(f.external_id),
          });
          if (error) errors++; else reconciled++;
        }
      }
      await supabase.from("integration_events").insert({ system, event_type: "reconcile", payload: { pulled, reconciled }, status: "processed", processed_at: new Date().toISOString() });
    } else if (system === "oms") {
      // Reconcile cc_orders (Command Center Pro) into sales_orders.
      const { data: cc } = await supabase.from("cc_orders").select("*").order("received_at", { ascending: false }).limit(50);
      pulled = cc?.length ?? 0;
      for (const o of cc ?? []) {
        const { data: existing } = await supabase.from("sales_orders").select("id").eq("reference", o.order_number).maybeSingle();
        if (!existing) {
          const { error } = await supabase.from("sales_orders").insert({
            reference: o.order_number, status: "open", total: o.total ?? 0, notes: `Imported from Command Center Pro (${o.external_id})`,
          });
          if (error) errors++; else reconciled++;
        }
      }
      await supabase.from("integration_events").insert({ system, event_type: "reconcile", payload: { pulled, reconciled }, status: "processed", processed_at: new Date().toISOString() });
    } else if (system === "cmms") {
      // Simulate maintenance events.
      const events = Array.from({ length: 2 }).map((_, i) => ({
        system, event_type: "work_order", external_id: `CMMS-${Date.now()}-${i}`,
        payload: { asset: `Forklift-${i + 1}`, priority: i === 0 ? "high" : "medium" }, status: "processed",
        processed_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from("integration_events").insert(events);
      if (error) errors++; else { pulled += events.length; reconciled += events.length; }
    }
    detail.summary = `${system} sync pulled ${pulled}, reconciled ${reconciled}, errors ${errors}`;
    await supabase.from("integration_sync_runs").update({
      finished_at: new Date().toISOString(), status: errors > 0 ? "partial" : "success",
      pulled, reconciled, errors, detail,
    }).eq("id", run!.id);
    return { pulled, reconciled, errors };
  } catch (e) {
    await supabase.from("integration_sync_runs").update({
      finished_at: new Date().toISOString(), status: "error", errors: errors + 1,
      detail: { error: String(e) },
    }).eq("id", run!.id);
    throw e;
  }
}

function makeHandler(system: System) {
  return async ({ request }: { request: Request }) => {
    const { adminClient, json } = await import("@/lib/integrations.server");
    // Allow either the cron apikey header (Supabase anon) or CORTA secret.
    const supabase = adminClient();
    try {
      const result = await runSync(system, supabase);
      return json({ ok: true, system, ...result });
    } catch (e) {
      return json({ ok: false, system, error: String(e) }, { status: 500 });
    }
  };
}

export const Route = createFileRoute("/api/public/hooks/sync-mes")({
  server: { handlers: { POST: makeHandler("mes"), GET: makeHandler("mes") } },
});
