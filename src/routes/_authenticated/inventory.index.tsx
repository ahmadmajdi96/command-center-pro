import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, Boxes } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { TableToolbar } from "@/components/table-toolbar";

export const Route = createFileRoute("/_authenticated/inventory/")({
  head: () => ({ meta: [{ title: "Inventory · CORTA WMS" }] }),
  component: InventoryPage,
});

type Row = {
  id: string; qty: number; lot: string | null; expiry: string | null; status: string;
  products: { sku: string; name: string; uom: string } | null;
  warehouses: { code: string; name: string } | null;
  bins: { code: string } | null;
};

function InventoryPage() {
  const { canOperate } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("inventory")
      .select("id, qty, lot, expiry, status, products(sku,name,uom), warehouses(code,name), bins(code)")
      .order("updated_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    setRows((data ?? []) as any);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const totalUnits = rows.reduce((s, r) => s + Number(r.qty || 0), 0);

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Live stock positions with lot, expiry and status"
        actions={canOperate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> New stock line
              </button>
            </DialogTrigger>
            <InventoryForm onDone={() => { setOpen(false); load(); }} />
          </Dialog>
        )} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lines" value={rows.length} tone="primary" />
        <Stat label="Total units" value={totalUnits.toLocaleString()} tone="info" />
        <Stat label="Quality hold" value={rows.filter(r => r.status === "quality_hold").length} tone="warning" />
        <Stat label="Reserved" value={rows.filter(r => r.status === "reserved").length} tone="accent" />
      </div>

      <div className="glass-panel rounded-2xl p-4">
        {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
        : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Boxes className="mx-auto h-8 w-8 mb-2" />No inventory yet. Create products, then add stock lines.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">SKU</th><th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Warehouse</th><th className="py-2 pr-3">Bin</th>
                <th className="py-2 pr-3">Lot</th><th className="py-2 pr-3">Expiry</th>
                <th className="py-2 pr-3 text-right">Qty</th><th className="py-2 pr-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="py-2.5 pr-3 font-mono text-xs text-primary">{r.products?.sku}</td>
                  <td className="py-2.5 pr-3 text-xs">{r.products?.name}</td>
                  <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{r.warehouses?.code}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px]">{r.bins?.code ?? "—"}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{r.lot ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-[11px]">{r.expiry ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{r.qty} <span className="text-[10px] text-muted-foreground">{r.products?.uom}</span></td>
                  <td className="py-2.5 pr-3 text-right"><StatusPill status={r.status.toUpperCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InventoryForm({ onDone }: { onDone: () => void }) {
  const [warehouses, setWarehouses] = useState<{ id: string; code: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; sku: string; name: string }[]>([]);
  const [bins, setBins] = useState<{ id: string; code: string }[]>([]);
  const [f, setF] = useState({ warehouse_id: "", product_id: "", bin_id: "", lot: "", expiry: "", qty: 1, status: "available" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [w, p] = await Promise.all([
        supabase.from("warehouses").select("id,code,name"),
        supabase.from("products").select("id,sku,name"),
      ]);
      setWarehouses((w.data ?? []) as any); setProducts((p.data ?? []) as any);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      if (!f.warehouse_id) return setBins([]);
      const { data } = await supabase
        .from("bins")
        .select("id,code, racks!inner(aisles!inner(zones!inner(warehouse_id)))")
        .eq("racks.aisles.zones.warehouse_id", f.warehouse_id).limit(200);
      setBins(((data ?? []) as any).map((b: any) => ({ id: b.id, code: b.code })));
    })();
  }, [f.warehouse_id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload: any = { ...f, expiry: f.expiry || null, bin_id: f.bin_id || null };
    const { error } = await supabase.from("inventory").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Inventory line added"); onDone();
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add inventory line</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <select required value={f.warehouse_id} onChange={(e) => setF({ ...f, warehouse_id: e.target.value })} className="input">
          <option value="">Warehouse…</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.code} · {w.name}</option>)}
        </select>
        <select required value={f.product_id} onChange={(e) => setF({ ...f, product_id: e.target.value })} className="input">
          <option value="">Product…</option>{products.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
        </select>
        <select value={f.bin_id} onChange={(e) => setF({ ...f, bin_id: e.target.value })} className="input">
          <option value="">Bin (optional)…</option>{bins.map((b) => <option key={b.id} value={b.id}>{b.code}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="Lot" value={f.lot} onChange={(e) => setF({ ...f, lot: e.target.value })} className="input" />
          <input type="date" value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} className="input" />
          <input required type="number" placeholder="Qty" value={f.qty} onChange={(e) => setF({ ...f, qty: +e.target.value })} className="input" />
        </div>
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="input">
          <option value="available">Available</option><option value="quality_hold">Quality hold</option>
          <option value="reserved">Reserved</option><option value="damaged">Damaged</option>
        </select>
        <DialogFooter><button disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">{saving ? "Saving…" : "Add"}</button></DialogFooter>
      </form>
      <style>{`.input{width:100%;border-radius:.5rem;border:1px solid oklch(0.3 0.02 245/.6);background:oklch(0.16 0.02 245/.6);padding:.5rem .75rem;font-size:.8rem}`}</style>
    </DialogContent>
  );
}
