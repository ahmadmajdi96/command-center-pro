import { createFileRoute } from "@tanstack/react-router";
import { Plus, Scan } from "lucide-react";
import { cycleCounts } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/cycle-counts")({
  head: () => ({ meta: [{ title: "Cycle Counts · CORTA WMS" }] }),
  component: CyclePage,
});

function CyclePage() {
  return (
    <div>
      <PageHeader
        title="Cycle Counts"
        subtitle="ABC-classed scheduled counts and spot counts with variance reconciliation"
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">Spot count</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> New count
            </button>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open" value={cycleCounts.filter(c => c.status === "OPEN").length} tone="warning" />
        <Stat label="In progress" value={cycleCounts.filter(c => c.status === "IN_PROGRESS").length} tone="accent" />
        <Stat label="Completed today" value={cycleCounts.filter(c => c.status === "COMPLETED").length} tone="success" />
        <Stat label="Total variances" value={cycleCounts.reduce((s, c) => s + c.variance, 0)} tone="info" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Scan className="h-4 w-4 text-primary" />
          <span className="font-semibold">Count tasks</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Zone</th>
              <th className="py-2 pr-3">Assigned</th>
              <th className="py-2 pr-3">Scheduled</th>
              <th className="py-2 pr-3">Progress</th>
              <th className="py-2 pr-3 text-right">Variances</th>
              <th className="py-2 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {cycleCounts.map((c) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{c.id}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{c.zone}</td>
                <td className="py-2.5 pr-3 text-xs">{c.assigned}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{c.scheduled}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-info" style={{ width: `${c.target ? (c.scanned / c.target) * 100 : 0}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{c.scanned}/{c.target}</span>
                  </div>
                </td>
                <td className={`py-2.5 pr-3 text-right font-mono text-xs ${c.variance ? "text-warning" : "text-muted-foreground"}`}>{c.variance}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
