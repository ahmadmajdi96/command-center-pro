import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus } from "lucide-react";
import { qualityHolds } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/quality")({
  head: () => ({ meta: [{ title: "Quality Holds · CORTA WMS" }] }),
  component: QualityPage,
});

function QualityPage() {
  return (
    <div>
      <PageHeader
        title="Quality Holds & Inspections"
        subtitle="Hold / release · non-conformance logging · integrated with QMS"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Raise hold
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active holds" value={qualityHolds.filter(q => q.status === "HOLD").length} tone="warning" />
        <Stat label="Quarantined" value={qualityHolds.filter(q => q.status === "QUARANTINED").length} tone="destructive" />
        <Stat label="Released" value={qualityHolds.filter(q => q.status === "RELEASED").length} tone="success" />
        <Stat label="Rejected" value={qualityHolds.filter(q => q.status === "REJECTED").length} tone="info" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-warning" />
          <span className="font-semibold">Quality records</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3">Lot</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="py-2 pr-3">Reason</th>
              <th className="py-2 pr-3">Raised</th>
              <th className="py-2 pr-3">Inspector</th>
              <th className="py-2 pr-3 text-right">Status</th>
              <th className="py-2 pr-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {qualityHolds.map((q) => (
              <tr key={q.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{q.id}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{q.sku}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{q.lot}</td>
                <td className="py-2.5 pr-3 text-right font-mono">{q.qty}</td>
                <td className="py-2.5 pr-3 text-xs">{q.reason}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{q.raised}</td>
                <td className="py-2.5 pr-3 text-xs">{q.inspector}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={q.status} /></td>
                <td className="py-2.5 pr-3 text-right">
                  {q.status === "HOLD" && (
                    <div className="inline-flex gap-1">
                      <button className="rounded-md border border-success/40 bg-success/10 px-2 py-1 text-[11px] text-success">Release</button>
                      <button className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] text-destructive">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
