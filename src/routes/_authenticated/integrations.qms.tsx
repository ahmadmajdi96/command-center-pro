import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { integrations, qualityHolds } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/integrations/qms")({
  head: () => ({ meta: [{ title: "QMS Integration · CORTA WMS" }] }),
  component: QmsPage,
});

function QmsPage() {
  const cfg = integrations.QMS;
  return (
    <div>
      <PageHeader
        title="QMS Integration"
        subtitle="Inspection lots, holds and non-conformance sync with the Quality Management System"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Sync now
          </button>
        }
      />
      <div className="mb-5 rounded-2xl border border-success/40 bg-success/5 p-4">
        <div className="flex items-start gap-3">
          <span className="status-dot mt-1 text-success animate-pulse-glow" />
          <div>
            <div className="text-sm font-semibold">QMS connection healthy</div>
            <p className="text-xs text-muted-foreground">Endpoint {cfg.endpoint} · last sync {cfg.lastSync}</p>
          </div>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Events / 24h" value={cfg.events24h} />
        <Stat label="Inspection lots (open)" value={4} tone="warning" />
        <Stat label="NCRs (30d)" value={12} tone="info" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-warning" />
          <span className="font-semibold">Recent inspection decisions</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Hold ID</th>
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3">Lot</th>
              <th className="py-2 pr-3">Reason</th>
              <th className="py-2 pr-3">Inspector</th>
              <th className="py-2 pr-3 text-right">Decision</th>
            </tr>
          </thead>
          <tbody>
            {qualityHolds.map((q) => (
              <tr key={q.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{q.id}</td>
                <td className="py-2.5 pr-3 font-mono text-xs">{q.sku}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{q.lot}</td>
                <td className="py-2.5 pr-3 text-xs">{q.reason}</td>
                <td className="py-2.5 pr-3 text-xs">{q.inspector}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
