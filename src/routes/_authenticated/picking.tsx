import { createFileRoute } from "@tanstack/react-router";
import { Play, Plus } from "lucide-react";
import { pickWaves } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/picking")({
  head: () => ({ meta: [{ title: "Picking · CORTA WMS" }] }),
  component: PickingPage,
});

function PickingPage() {
  return (
    <div>
      <PageHeader
        title="Picking"
        subtitle="Wave · Order · Cluster picking strategies"
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Build wave
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Play className="h-3.5 w-3.5" /> Release wave
            </button>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active waves" value={pickWaves.filter(w => w.status === "RUNNING").length} tone="success" />
        <Stat label="Planned" value={pickWaves.filter(w => w.status === "PLANNED").length} tone="info" />
        <Stat label="Lines to pick" value={pickWaves.reduce((s, w) => s + (w.status !== "COMPLETED" ? w.lines : 0), 0)} tone="accent" />
        <Stat label="Avg. pick / hr" value={182} tone="primary" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pickWaves.map((w) => (
          <div key={w.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-primary">{w.id}</div>
                <div className="mt-1 text-sm font-medium">{w.strategy} pick</div>
              </div>
              <StatusPill status={w.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Orders</span> · <span className="font-mono">{w.orders}</span></div>
              <div><span className="text-muted-foreground">Lines</span> · <span className="font-mono">{w.lines}</span></div>
              <div><span className="text-muted-foreground">Picker</span> · <span>{w.picker}</span></div>
              <div><span className="text-muted-foreground">Started</span> · <span className="font-mono">{w.started}</span></div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono">{w.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary" style={{ width: `${w.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
