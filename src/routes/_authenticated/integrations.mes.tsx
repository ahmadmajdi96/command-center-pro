import { createFileRoute } from "@tanstack/react-router";
import { Factory, RefreshCw } from "lucide-react";
import { integrations, mesEvents } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/integrations/mes")({
  head: () => ({ meta: [{ title: "MES Integration · CORTA WMS" }] }),
  component: MesPage,
});

function MesPage() {
  const cfg = integrations.MES;
  return (
    <div>
      <PageHeader
        title="MES Integration"
        subtitle="Raw material consumption · finished goods receipt · WIP tracking"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Sync now
          </button>
        }
      />

      <div className="mb-5 rounded-2xl border border-success/40 bg-success/5 p-4">
        <div className="flex items-start gap-3">
          <span className="status-dot mt-1 text-success animate-pulse-glow" />
          <div>
            <div className="text-sm font-semibold">MES connection healthy</div>
            <p className="text-xs text-muted-foreground">Endpoint {cfg.endpoint} · last sync {cfg.lastSync}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Events / 24h" value={cfg.events24h.toLocaleString()} tone="primary" />
        <Stat label="Consumption evt" value={mesEvents.filter(e => e.type === "CONSUME").length} tone="info" />
        <Stat label="Production evt" value={mesEvents.filter(e => e.type === "PRODUCE").length} tone="success" />
        <Stat label="Scrap evt" value={mesEvents.filter(e => e.type === "SCRAP").length} tone="destructive" />
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Factory className="h-4 w-4 text-primary" />
          <span className="font-semibold">Live MES events</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">Work Order</th>
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="py-2 pr-3">UOM</th>
            </tr>
          </thead>
          <tbody>
            {mesEvents.map((e, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{e.t}</td>
                <td className="py-2.5 pr-3"><StatusPill status={e.type === "PRODUCE" ? "COMPLETED" : e.type === "CONSUME" ? "PICKING" : "REJECTED"} /></td>
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{e.wo}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{e.sku}</td>
                <td className="py-2.5 pr-3 text-right font-mono">{e.qty}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{e.uom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
