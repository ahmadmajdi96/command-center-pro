import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { integrations, salesOrders } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/integrations/oms")({
  head: () => ({ meta: [{ title: "OMS Integration · CORTA WMS" }] }),
  component: OmsPage,
});

function OmsPage() {
  const cfg = integrations.OMS;
  return (
    <div>
      <PageHeader
        title="OMS Integration"
        subtitle="Sales order import · allocation · backorder handling"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Pull orders
          </button>
        }
      />
      <div className="mb-5 rounded-2xl border border-success/40 bg-success/5 p-4">
        <div className="flex items-start gap-3">
          <span className="status-dot mt-1 text-success animate-pulse-glow" />
          <div>
            <div className="text-sm font-semibold">OMS connection healthy</div>
            <p className="text-xs text-muted-foreground">Endpoint {cfg.endpoint} · last sync {cfg.lastSync}</p>
          </div>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Events / 24h" value={cfg.events24h.toLocaleString()} />
        <Stat label="Orders synced" value={salesOrders.length} tone="info" />
        <Stat label="Backorders" value={2} tone="warning" />
        <Stat label="Auto-allocated" value="94%" tone="success" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <ShoppingCart className="h-4 w-4 text-info" />
          <span className="font-semibold">Recently imported sales orders</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">SO</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Requested</th>
              <th className="py-2 pr-3 text-right">Lines</th>
              <th className="py-2 pr-3 text-right">Value</th>
              <th className="py-2 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {salesOrders.map((s) => (
              <tr key={s.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{s.id}</td>
                <td className="py-2.5 pr-3 text-xs">{s.customerName}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{s.requested}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{s.lines}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">${s.value.toLocaleString()}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
