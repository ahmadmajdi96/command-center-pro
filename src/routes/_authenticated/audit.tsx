import { createFileRoute } from "@tanstack/react-router";
import { History, Download } from "lucide-react";
import { auditLog } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit Log · CORTA WMS" }] }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Every mutation is traced. Immutable · exportable · signed."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Events (24h)" value={4218} />
        <Stat label="Users active" value={22} tone="success" />
        <Stat label="System events" value={1284} tone="info" />
        <Stat label="Failed attempts" value={3} tone="destructive" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <History className="h-4 w-4 text-primary" />
          <span className="font-semibold">Latest events</span>
        </div>
        <div className="space-y-2">
          {[...auditLog, ...auditLog].map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 text-xs">
              <span className="font-mono text-[10px] text-muted-foreground">{a.t}</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">{a.action}</span>
              <span className="font-mono text-[11px]">{a.entity}</span>
              <span className="ml-auto truncate text-muted-foreground">{a.detail}</span>
              <span className="text-[10px] text-muted-foreground">@{a.user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
