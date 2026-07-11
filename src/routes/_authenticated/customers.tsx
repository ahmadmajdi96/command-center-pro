import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { customers } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers · CORTA WMS" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Ship-to master and credit exposure"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New customer
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Customers" value={customers.length} />
        <Stat label="Credit" value={`$${(customers.reduce((s,c) => s + c.credit, 0) / 1e6).toFixed(2)}M`} tone="info" />
        <Stat label="Retail chains" value={customers.filter(c => c.type === "Retail Chain").length} tone="success" />
        <Stat label="Orders (12m)" value={customers.reduce((s, c) => s + c.orders, 0).toLocaleString()} tone="accent" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Country</th>
              <th className="py-2 pr-3 text-right">Credit</th>
              <th className="py-2 pr-3 text-right">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{c.id}</td>
                <td className="py-2.5 pr-3 text-xs">{c.name}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{c.type}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{c.country}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">${c.credit.toLocaleString()}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{c.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
