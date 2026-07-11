import { createFileRoute } from "@tanstack/react-router";
import { Plus, PackageOpen } from "lucide-react";
import { receipts } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/receiving")({
  head: () => ({ meta: [{ title: "Receiving · CORTA WMS" }] }),
  component: ReceivingPage,
});

function ReceivingPage() {
  return (
    <div>
      <PageHeader
        title="Receiving"
        subtitle="PO and blind receipts · QA inspection · directed putaway"
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">Blind receipt</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> Receive PO
            </button>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open receipts" value={receipts.filter(r => r.status !== "COMPLETED").length} tone="warning" />
        <Stat label="Awaiting QA" value={receipts.filter(r => r.status === "INSPECTING").length} tone="info" />
        <Stat label="Ready to putaway" value={receipts.filter(r => r.status === "PUTAWAY").length} tone="accent" />
        <Stat label="Completed today" value={receipts.filter(r => r.status === "COMPLETED").length} tone="success" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <PackageOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold">Inbound receipts</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Receipt</th>
              <th className="py-2 pr-3">PO</th>
              <th className="py-2 pr-3">Supplier</th>
              <th className="py-2 pr-3">Dock</th>
              <th className="py-2 pr-3">Received</th>
              <th className="py-2 pr-3 text-right">Lines</th>
              <th className="py-2 pr-3 text-right">Accepted</th>
              <th className="py-2 pr-3 text-right">Rejected</th>
              <th className="py-2 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{r.id}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{r.po}</td>
                <td className="py-2.5 pr-3 text-xs">{r.supplier}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{r.dock}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{r.received}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{r.lines}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs text-success">{r.accepted}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs text-destructive">{r.rejected}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
