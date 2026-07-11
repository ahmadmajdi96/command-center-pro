import { createFileRoute } from "@tanstack/react-router";
import { PackageCheck, ArrowRight, Play } from "lucide-react";
import { receipts } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/putaway")({
  head: () => ({ meta: [{ title: "Putaway · CORTA WMS" }] }),
  component: PutawayPage,
});

// Directed putaway suggestions
const suggestions = [
  { id: "PA-2211", sku: "SKU-1003", name: "Basmati Rice 5kg", from: "D-01", to: "A-12-03-B", qty: 240, uom: "BAG", strategy: "Bulk / FIFO" },
  { id: "PA-2212", sku: "SKU-1005", name: "Date Syrup 500ml", from: "D-01", to: "B-11-04-C", qty: 120, uom: "BTL", strategy: "Pick face top-up" },
  { id: "PA-2213", sku: "SKU-1006", name: "Tahini Paste 400g", from: "D-02", to: "B-09-02-A", qty: 480, uom: "JAR", strategy: "Bulk / FEFO" },
  { id: "PA-2214", sku: "SKU-1011", name: "Cinnamon Sticks 100g", from: "D-01", to: "Z-06 QA HOLD", qty: 160, uom: "EA", strategy: "Hold — QA sample" },
];

function PutawayPage() {
  const pending = receipts.filter(r => r.status === "PUTAWAY").length;
  return (
    <div>
      <PageHeader
        title="Putaway"
        subtitle="Directed putaway suggestions from receiving dock to storage"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Play className="h-3.5 w-3.5" /> Start putaway run
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pending receipts" value={pending} tone="warning" />
        <Stat label="Suggestions" value={suggestions.length} tone="info" />
        <Stat label="Available bins" value={412} tone="success" />
        <Stat label="Avg. cycle time" value="04:12" hint="min" tone="accent" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <PackageCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold">Directed putaway tasks</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Task</th>
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">From</th>
              <th className="py-2 pr-3">To</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="py-2 pr-3">Strategy</th>
              <th className="py-2 pr-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{s.id}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{s.sku}</td>
                <td className="py-2.5 pr-3 text-xs">{s.name}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{s.from}</td>
                <td className="py-2.5 pr-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                    <ArrowRight className="h-3 w-3" /> {s.to}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-right font-mono">{s.qty} {s.uom}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{s.strategy}</td>
                <td className="py-2.5 pr-3 text-right">
                  <button className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary">Confirm</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
