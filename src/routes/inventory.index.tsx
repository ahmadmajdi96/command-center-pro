import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, Plus, Repeat, Download } from "lucide-react";
import { inventory, plantKpis, warehouses } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/inventory/")({
  head: () => ({ meta: [{ title: "Stock Overview · CORTA WMS" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [wh, setWh] = useState<string>("ALL");

  const rows = inventory.filter((r) =>
    (status === "ALL" || r.status === status) &&
    (wh === "ALL" || r.warehouse === wh) &&
    (q === "" || `${r.sku} ${r.name} ${r.lot} ${r.location}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Stock Overview"
        subtitle="Real-time inventory across all warehouses · FIFO/FEFO aware"
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent">
              <Repeat className="h-3.5 w-3.5" /> Transfer
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> Adjustment
            </button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="SKUs" value={plantKpis.skus.toLocaleString()} hint="Master data" />
        <Stat label="Value" value={`$${(plantKpis.inventoryValue / 1e6).toFixed(2)}M`} tone="info" />
        <Stat label="Turnover" value={plantKpis.turnover} hint="x per year" tone="success" />
        <Stat label="On Hold" value={plantKpis.onHold} tone="warning" />
        <Stat label="Quarantined" value={plantKpis.quarantined} tone="destructive" />
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search SKU, lot, location…"
              className="h-9 w-72 rounded-lg border border-border/60 bg-card/60 pl-8 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
            />
          </div>
          <select value={wh} onChange={(e) => setWh(e.target.value)} className="h-9 rounded-lg border border-border/60 bg-card/60 px-3 text-xs">
            <option value="ALL">All warehouses</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.code} · {w.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-lg border border-border/60 bg-card/60 px-3 text-xs">
            {["ALL", "AVAILABLE", "RESERVED", "HOLD", "QUARANTINED", "IN_TRANSIT"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-xs text-muted-foreground">{rows.length} lines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Warehouse</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Lot</th>
                <th className="py-2 pr-3 text-right">Qty</th>
                <th className="py-2 pr-3">UOM</th>
                <th className="py-2 pr-3">Expiry</th>
                <th className="py-2 pr-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border/40 transition hover:bg-card/40">
                  <td className="py-2.5 pr-3 font-mono text-xs text-primary">{r.sku}</td>
                  <td className="py-2.5 pr-3 text-xs">{r.name}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{r.warehouse}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px]">{r.location}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{r.lot}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{r.qty.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{r.uom}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{r.expiry}</td>
                  <td className="py-2.5 pr-3 text-right"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
