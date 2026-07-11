import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { salesOrders } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/sales-orders")({
  head: () => ({ meta: [{ title: "Sales Orders · CORTA WMS" }] }),
  component: SOPage,
});

function SOPage() {
  return (
    <div>
      <PageHeader
        title="Sales Orders"
        subtitle="Outbound orders synced from OMS · allocation and backorder"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New SO
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total SOs" value={salesOrders.length} />
        <Stat label="Open" value={salesOrders.filter(s => s.status === "OPEN").length} tone="warning" />
        <Stat label="In pick" value={salesOrders.filter(s => s.status === "PARTIAL").length} tone="accent" />
        <Stat label="Value" value={`$${(salesOrders.reduce((s, o) => s + o.value, 0) / 1000).toFixed(0)}k`} tone="info" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">SO</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Requested</th>
              <th className="py-2 pr-3 text-right">Lines</th>
              <th className="py-2 pr-3 text-right">Value</th>
              <th className="py-2 pr-3">Picked</th>
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
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary" style={{ width: `${s.picked}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{s.picked}%</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
