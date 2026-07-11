import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { suppliers } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · CORTA WMS" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Vendor master data · payment terms and performance"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New supplier
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Suppliers" value={suppliers.length} />
        <Stat label="Avg. rating" value={(suppliers.reduce((s, x) => s + x.rating, 0) / suppliers.length).toFixed(2)} tone="success" />
        <Stat label="Countries" value={new Set(suppliers.map(s => s.country)).size} tone="info" />
        <Stat label="POs (12m)" value={suppliers.reduce((s, x) => s + x.orders, 0)} tone="accent" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Country</th>
              <th className="py-2 pr-3">Contact</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Terms</th>
              <th className="py-2 pr-3 text-right">Rating</th>
              <th className="py-2 pr-3 text-right">POs</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{s.id}</td>
                <td className="py-2.5 pr-3 text-xs">{s.name}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{s.country}</td>
                <td className="py-2.5 pr-3 text-xs">{s.contact}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{s.email}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{s.terms}</td>
                <td className="py-2.5 pr-3 text-right">
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-accent" /> {s.rating}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-right font-mono text-xs">{s.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
