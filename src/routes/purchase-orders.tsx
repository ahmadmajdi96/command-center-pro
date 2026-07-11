import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { purchaseOrders } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders · CORTA WMS" }] }),
  component: POsPage,
});

function POsPage() {
  const total = purchaseOrders.length;
  const open = purchaseOrders.filter(p => p.status === "OPEN" || p.status === "PARTIAL").length;
  const value = purchaseOrders.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Inbound orders · linked to supplier and receipts"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New PO
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total POs" value={total} />
        <Stat label="Open / Partial" value={open} tone="warning" />
        <Stat label="Total value" value={`$${(value / 1000).toFixed(0)}k`} tone="info" />
        <Stat label="Received %" value={`${Math.round(purchaseOrders.reduce((s, p) => s + p.received, 0) / total)}%`} tone="success" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">PO</th>
              <th className="py-2 pr-3">Supplier</th>
              <th className="py-2 pr-3">ETA</th>
              <th className="py-2 pr-3 text-right">Lines</th>
              <th className="py-2 pr-3 text-right">Value</th>
              <th className="py-2 pr-3">Received</th>
              <th className="py-2 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{p.id}</td>
                <td className="py-2.5 pr-3 text-xs">{p.supplierName}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{p.eta}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{p.lines}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">${p.value.toLocaleString()}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-info" style={{ width: `${p.received}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{p.received}%</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
