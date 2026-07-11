import { createFileRoute } from "@tanstack/react-router";
import { Plus, Check, X } from "lucide-react";
import { adjustments } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/inventory/adjustments")({
  head: () => ({ meta: [{ title: "Adjustments · CORTA WMS" }] }),
  component: AdjustmentsPage,
});

function AdjustmentsPage() {
  const total = adjustments.length;
  const pending = adjustments.filter((a) => !a.approved).length;
  const net = adjustments.reduce((s, a) => s + a.delta, 0);
  return (
    <div>
      <PageHeader
        title="Inventory Adjustments"
        subtitle="Reason-coded stock corrections with approval flow"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New Adjustment
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total adjustments" value={total} hint="last 30 days" />
        <Stat label="Pending approval" value={pending} tone="warning" />
        <Stat label="Net units" value={net >= 0 ? `+${net}` : net} tone={net >= 0 ? "success" : "destructive"} />
        <Stat label="Approvers" value={2} tone="info" hint="Manager + Supervisor" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3">Location</th>
              <th className="py-2 pr-3 text-right">Delta</th>
              <th className="py-2 pr-3">Reason</th>
              <th className="py-2 pr-3">By</th>
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3 text-right">Approval</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map((a) => (
              <tr key={a.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs">{a.id}</td>
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{a.sku}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{a.location}</td>
                <td className={`py-2.5 pr-3 text-right font-mono font-medium ${a.delta > 0 ? "text-success" : "text-destructive"}`}>
                  {a.delta > 0 ? `+${a.delta}` : a.delta}
                </td>
                <td className="py-2.5 pr-3 text-xs">{a.reason}</td>
                <td className="py-2.5 pr-3 text-xs">{a.by}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{a.when}</td>
                <td className="py-2.5 pr-3 text-right">
                  {a.approved ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success"><Check className="h-3 w-3" /> Approved</span>
                  ) : (
                    <div className="inline-flex items-center gap-1.5">
                      <button className="rounded-md border border-success/40 bg-success/10 p-1 text-success"><Check className="h-3 w-3" /></button>
                      <button className="rounded-md border border-destructive/40 bg-destructive/10 p-1 text-destructive"><X className="h-3 w-3" /></button>
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
