import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { products } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "Products · CORTA WMS" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Product Master"
        subtitle="SKU catalog with UOM, lot / serial rules and stock thresholds"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New product
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active SKUs" value={products.length} />
        <Stat label="Lot-managed" value={products.filter(p => p.lot).length} tone="info" />
        <Stat label="Serial-managed" value={products.filter(p => p.serial).length} tone="accent" />
        <Stat label="Below min" value={products.filter(p => p.onHand < p.min).length} tone="warning" />
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">SKU</th>
              <th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">UOM</th>
              <th className="py-2 pr-3 text-right">Weight (kg)</th>
              <th className="py-2 pr-3">Tracking</th>
              <th className="py-2 pr-3 text-right">On hand</th>
              <th className="py-2 pr-3 text-right">Min / Max</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.onHand < p.min;
              return (
                <tr key={p.id} className="border-t border-border/40">
                  <td className="py-2.5 pr-3 font-mono text-xs text-primary">{p.id}</td>
                  <td className="py-2.5 pr-3 text-xs">{p.name}</td>
                  <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{p.category}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px]">{p.uom}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-[11px]">{p.weight}</td>
                  <td className="py-2.5 pr-3 text-[10px]">
                    {p.lot && <span className="mr-1 rounded bg-info/10 px-1.5 py-0.5 text-info">LOT</span>}
                    {p.serial && <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">SERIAL</span>}
                    {!p.lot && !p.serial && <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className={`py-2.5 pr-3 text-right font-mono ${low ? "text-warning" : ""}`}>{p.onHand.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-[11px] text-muted-foreground">{p.min} / {p.max}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
