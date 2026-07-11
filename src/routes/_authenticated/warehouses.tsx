import { createFileRoute } from "@tanstack/react-router";
import { Warehouse, MapPin, Plus } from "lucide-react";
import { warehouses, zones } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/warehouses")({
  head: () => ({ meta: [{ title: "Warehouses · CORTA WMS" }] }),
  component: WarehousesPage,
});

function WarehousesPage() {
  return (
    <div>
      <PageHeader
        title="Warehouses"
        subtitle="Hierarchical location structure: warehouse → zone → aisle → rack → bin"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New warehouse
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Warehouses" value={warehouses.length} />
        <Stat label="Active" value={warehouses.filter(w => w.active).length} tone="success" />
        <Stat label="Zones" value={warehouses.reduce((s, w) => s + w.zones, 0)} tone="info" />
        <Stat label="Locations" value={warehouses.reduce((s, w) => s + w.locations, 0).toLocaleString()} tone="accent" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {warehouses.map((w) => (
          <div key={w.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-info/20 text-primary">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{w.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{w.code} · {w.country}</div>
                </div>
              </div>
              <StatusPill status={w.active ? "active" : "inactive"} />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{w.type}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <div className="font-mono text-lg">{w.zones}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Zones</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <div className="font-mono text-lg">{w.locations.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Locations</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Zones · Riyadh DC (WH-01)</h3>
            <p className="text-xs text-muted-foreground">8 zones · 1,240 bins</p>
          </div>
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {zones.map((z) => (
            <div key={z.id} className="rounded-lg border border-border/60 bg-card/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary">{z.id}</span>
                <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{z.type}</span>
              </div>
              <div className="mt-1 text-sm font-medium">{z.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{z.locations} locations</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
