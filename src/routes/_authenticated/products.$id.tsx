import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";
import { TrendCard, CategoryPie, BarCard } from "@/components/mini-analytics";

export const Route = createFileRoute("/_authenticated/products/$id")({
  head: () => ({ meta: [{ title: "Product · CORTA WMS" }] }),
  component: ProductProfile,
});

type P = { id: string; sku: string; name: string; category: string | null; uom: string; abc_class: string | null; hazmat: boolean; min_stock: number; max_stock: number; created_at: string };
type Inv = { id: string; qty: number; lot: string | null; expiry: string | null; status: string; warehouses: { code: string; name: string } | null; bins: { code: string } | null };
type Adj = { id: string; reference: string; quantity_delta: number; reason: string; status: string; created_at: string };
type Line = { id: string; qty_ordered: number; qty_received?: number; qty_shipped?: number; created_at: string; kind: "PO" | "SO" };

function ProductProfile() {
  const { id } = useParams({ from: "/_authenticated/products/$id" });
  const [p, setP] = useState<P | null>(null);
  const [inv, setInv] = useState<Inv[]>([]);
  const [adj, setAdj] = useState<Adj[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [pr, iv, aj, pol, sol] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).maybeSingle(),
        supabase.from("inventory").select("id, qty, lot, expiry, status, warehouses(code,name), bins(code)").eq("product_id", id),
        supabase.from("inventory_adjustments").select("id, reference, quantity_delta, reason, status, created_at").eq("product_id", id).order("created_at", { ascending: false }).limit(50),
        supabase.from("purchase_order_lines").select("id, qty_ordered, qty_received, purchase_orders(created_at)").eq("product_id", id).limit(200),
        supabase.from("sales_order_lines").select("id, qty_ordered, qty_shipped, sales_orders(created_at)").eq("product_id", id).limit(200),
      ]);
      setP((pr.data ?? null) as P | null);
      setInv((iv.data ?? []) as unknown as Inv[]);
      setAdj((aj.data ?? []) as Adj[]);
      const poLines = ((pol.data ?? []) as any[]).map((r) => ({ id: r.id, qty_ordered: r.qty_ordered, qty_received: r.qty_received, created_at: r.purchase_orders?.created_at, kind: "PO" as const }));
      const soLines = ((sol.data ?? []) as any[]).map((r) => ({ id: r.id, qty_ordered: r.qty_ordered, qty_shipped: r.qty_shipped, created_at: r.sales_orders?.created_at, kind: "SO" as const }));
      setLines([...poLines, ...soLines]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  if (!p) return <div className="p-10 text-center text-sm">Product not found. <Link to="/products" className="text-primary underline">Back</Link></div>;

  const totalOnHand = inv.reduce((s, r) => s + Number(r.qty || 0), 0);
  const poVolume = lines.filter((l) => l.kind === "PO").reduce((s, l) => s + Number(l.qty_ordered || 0), 0);
  const soVolume = lines.filter((l) => l.kind === "SO").reduce((s, l) => s + Number(l.qty_ordered || 0), 0);
  const netAdj = adj.reduce((s, r) => s + Number(r.quantity_delta || 0), 0);

  return (
    <div>
      <PageHeader
        title={<span className="flex items-center gap-2"><Package className="h-4 w-4" /> {p.sku} · {p.name}</span>}
        subtitle={`${p.category ?? "Uncategorized"} · ${p.uom} · ABC ${p.abc_class ?? "?"} · Min ${p.min_stock} / Max ${p.max_stock}${p.hazmat ? " · HAZMAT" : ""}`}
        actions={<Link to="/products" className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"><ChevronLeft className="h-3.5 w-3.5" />Back</Link>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="On hand" value={totalOnHand.toLocaleString()} tone="primary" />
        <Stat label="Stock lines" value={inv.length} tone="info" />
        <Stat label="Purchased (u)" value={poVolume.toLocaleString()} tone="accent" />
        <Stat label="Sold (u)" value={soVolume.toLocaleString()} tone="success" />
        <Stat label="Net adjustments" value={netAdj.toLocaleString()} tone={netAdj >= 0 ? "success" : "warning"} />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <TrendCard title="Adjustments · 60d" rows={adj as unknown as Record<string, unknown>[]} dateField="created_at" days={60} color="oklch(0.78 0.18 75)" />
        <TrendCard title="Order lines · 60d" rows={lines as unknown as Record<string, unknown>[]} dateField="created_at" days={60} color="oklch(0.72 0.18 155)" />
        <CategoryPie title="Inventory by status" rows={inv as unknown as Record<string, unknown>[]} field="status" />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <BarCard
          title="On-hand by warehouse"
          data={Object.entries(inv.reduce<Record<string, number>>((a, r) => {
            const k = r.warehouses?.code ?? "—"; a[k] = (a[k] ?? 0) + Number(r.qty || 0); return a;
          }, {})).map(([name, value]) => ({ name, value }))}
        />
        <BarCard
          title="Purchase vs Sales (units)"
          data={[{ name: "Purchased", value: poVolume }, { name: "Sold", value: soVolume }]}
          color="oklch(0.7 0.16 265)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-sm font-semibold mb-2">Stock positions</div>
          {inv.length === 0 ? <p className="text-xs text-muted-foreground p-4 text-center">No inventory yet.</p> : (
            <table className="w-full text-xs">
              <thead><tr className="text-left text-[10px] uppercase text-muted-foreground"><th className="py-1">Warehouse</th><th>Bin</th><th>Lot</th><th>Expiry</th><th className="text-right">Qty</th><th className="text-right">Status</th></tr></thead>
              <tbody>{inv.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="py-1.5 text-muted-foreground">{r.warehouses?.code ?? "—"}</td>
                  <td className="font-mono">{r.bins?.code ?? "—"}</td>
                  <td className="font-mono text-muted-foreground">{r.lot ?? "—"}</td>
                  <td>{r.expiry ?? "—"}</td>
                  <td className="text-right font-mono">{r.qty}</td>
                  <td className="text-right"><StatusPill status={r.status.toUpperCase()} /></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-sm font-semibold mb-2">Recent adjustments</div>
          {adj.length === 0 ? <p className="text-xs text-muted-foreground p-4 text-center">No adjustments.</p> : (
            <table className="w-full text-xs">
              <thead><tr className="text-left text-[10px] uppercase text-muted-foreground"><th className="py-1">Ref</th><th>Reason</th><th className="text-right">Δ</th><th className="text-right">When</th></tr></thead>
              <tbody>{adj.slice(0, 12).map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="py-1.5 font-mono text-primary">{r.reference}</td>
                  <td className="text-muted-foreground">{r.reason}</td>
                  <td className={`text-right font-mono ${Number(r.quantity_delta) < 0 ? "text-destructive" : "text-emerald-400"}`}>{r.quantity_delta > 0 ? "+" : ""}{r.quantity_delta}</td>
                  <td className="text-right text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
