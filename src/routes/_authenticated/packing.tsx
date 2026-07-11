import { createFileRoute } from "@tanstack/react-router";
import { Package, Printer } from "lucide-react";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/packing")({
  head: () => ({ meta: [{ title: "Packing · CORTA WMS" }] }),
  component: PackingPage,
});

const stations = [
  { id: "PK-01", operator: "H. Rashid", so: "SO-77202", cartons: 6, packed: 74, target: 96, status: "RUNNING" },
  { id: "PK-02", operator: "N. Salem", so: "SO-77204", cartons: 3, packed: 42, target: 42, status: "COMPLETED" },
  { id: "PK-03", operator: "—", so: "—", cartons: 0, packed: 0, target: 0, status: "FREE" },
  { id: "PK-04", operator: "Y. Kadri", so: "SO-77206", cartons: 4, packed: 18, target: 68, status: "RUNNING" },
];

function PackingPage() {
  return (
    <div>
      <PageHeader
        title="Packing"
        subtitle="Cartonisation · label printing · shipment verification"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Printer className="h-3.5 w-3.5" /> Print labels
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Stations busy" value={stations.filter(s => s.status === "RUNNING").length} tone="accent" />
        <Stat label="Cartons packed" value={stations.reduce((s, x) => s + x.packed, 0)} tone="success" />
        <Stat label="Open shipments" value={19} tone="info" />
        <Stat label="Avg. carton time" value="1:42" tone="primary" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stations.map((s) => (
          <div key={s.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Package className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-medium">{s.id}</div>
                  <div className="text-[11px] text-muted-foreground">{s.operator}</div>
                </div>
              </div>
              <StatusPill status={s.status} />
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span className="font-mono">{s.so}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cartons</span><span className="font-mono">{s.cartons}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span className="font-mono">{s.packed}/{s.target}</span></div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-info" style={{ width: `${s.target ? (s.packed / s.target) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
