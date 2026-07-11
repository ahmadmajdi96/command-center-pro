import { createFileRoute } from "@tanstack/react-router";
import { Wrench, RefreshCw, AlertTriangle } from "lucide-react";
import { integrations, maintenanceEvents } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/integrations/cmms")({
  head: () => ({ meta: [{ title: "CMMS Integration · CORTA WMS" }] }),
  component: CmmsPage,
});

function CmmsPage() {
  const cfg = integrations.CMMS;
  return (
    <div>
      <PageHeader
        title="CMMS Integration"
        subtitle="Maintenance events that impact storage conditions or bin availability"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Retry connection
          </button>
        }
      />
      <div className="mb-5 rounded-2xl border border-warning/40 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <div>
            <div className="text-sm font-semibold">CMMS connection degraded</div>
            <p className="text-xs text-muted-foreground">Last successful sync {cfg.lastSync} · endpoint {cfg.endpoint}</p>
          </div>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Events / 24h" value={cfg.events24h} tone="warning" />
        <Stat label="Auto-holds triggered" value={1} tone="destructive" />
        <Stat label="Bins impacted" value={4} tone="info" />
        <Stat label="Techs on-shift" value={3} tone="accent" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Wrench className="h-4 w-4 text-primary" />
          <span className="font-semibold">Recent maintenance events</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Asset</th>
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">Impact</th>
              <th className="py-2 pr-3">Technician</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceEvents.map((e, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{e.t}</td>
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{e.asset}</td>
                <td className="py-2.5 pr-3 text-xs">{e.event}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{e.impact}</td>
                <td className="py-2.5 pr-3 text-xs">{e.tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
