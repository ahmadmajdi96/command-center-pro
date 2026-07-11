import { createFileRoute } from "@tanstack/react-router";
import { Truck, Plus, Check } from "lucide-react";
import { carriers } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/carriers")({
  head: () => ({ meta: [{ title: "Carriers · CORTA WMS" }] }),
  component: CarriersPage,
});

function CarriersPage() {
  return (
    <div>
      <PageHeader
        title="Carriers"
        subtitle="Integrated carriers with SCAC codes and on-time performance"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Add carrier
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Carriers" value={carriers.length} />
        <Stat label="Integrated" value={carriers.filter(c => c.integrated).length} tone="success" />
        <Stat label="Avg. transit" value={`${(carriers.reduce((s, c) => s + c.avgTransit, 0) / carriers.length).toFixed(1)}d`} tone="info" />
        <Stat label="On-time avg" value={`${(carriers.reduce((s, c) => s + c.onTime, 0) / carriers.length).toFixed(1)}%`} tone="accent" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {carriers.map((c) => (
          <div key={c.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">SCAC · {c.scac}</div>
                </div>
              </div>
              {c.integrated && <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] text-success"><Check className="h-3 w-3" /> API</span>}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{c.service}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <div className="font-mono text-lg">{c.avgTransit}d</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Transit</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <div className="font-mono text-lg text-success">{c.onTime}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">On time</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
