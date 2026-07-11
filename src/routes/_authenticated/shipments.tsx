import { createFileRoute } from "@tanstack/react-router";
import { Plus, Send } from "lucide-react";
import { shipments } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/shipments")({
  head: () => ({ meta: [{ title: "Shipments · CORTA WMS" }] }),
  component: ShipmentsPage,
});

function ShipmentsPage() {
  return (
    <div>
      <PageHeader
        title="Shipments"
        subtitle="BOL · tracking · carrier handoff and confirmation"
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">Generate BOL</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> New shipment
            </button>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Planned" value={shipments.filter(s => s.status === "PLANNED").length} tone="info" />
        <Stat label="Picking" value={shipments.filter(s => s.status === "PICKING").length} tone="accent" />
        <Stat label="Packed" value={shipments.filter(s => s.status === "PACKED").length} tone="warning" />
        <Stat label="Shipped" value={shipments.filter(s => s.status === "SHIPPED").length} tone="primary" />
        <Stat label="Delivered" value={shipments.filter(s => s.status === "DELIVERED").length} tone="success" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Send className="h-4 w-4 text-accent" />
          <span className="font-semibold">Outbound shipments</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Shipment</th>
              <th className="py-2 pr-3">SO</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Carrier</th>
              <th className="py-2 pr-3">Tracking</th>
              <th className="py-2 pr-3">Dock</th>
              <th className="py-2 pr-3 text-right">Pallets</th>
              <th className="py-2 pr-3 text-right">Weight (kg)</th>
              <th className="py-2 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{s.id}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{s.so}</td>
                <td className="py-2.5 pr-3 text-xs">{s.customer}</td>
                <td className="py-2.5 pr-3 text-xs">{s.carrier}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{s.tracking}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{s.dock}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{s.pallets}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{s.weight.toLocaleString()}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
