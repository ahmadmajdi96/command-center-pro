import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat } from "@/components/status-pill";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { TableToolbar } from "@/components/table-toolbar";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "Products · CORTA WMS" }] }),
  component: ProductsPage,
});

type P = { id: string; sku: string; name: string; category: string | null; uom: string; abc_class: string | null; hazmat: boolean; min_stock: number; max_stock: number };

function ProductsPage() {
  const { canManage } = useAuth();
  const [rows, setRows] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("sku");
    if (error) toast.error(error.message);
    setRows((data ?? []) as P[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => !q || r.sku.toLowerCase().includes(q.toLowerCase()) || r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader title="Products / SKU Master" subtitle="Master data for all items handled by the WMS"
        actions={canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> New SKU
              </button>
            </DialogTrigger>
            <ProductForm onDone={() => { setOpen(false); load(); }} />
          </Dialog>
        )} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="SKUs" value={rows.length} tone="primary" />
        <Stat label="Hazmat" value={rows.filter(r => r.hazmat).length} tone="destructive" />
        <Stat label="Class A" value={rows.filter(r => r.abc_class === "A").length} tone="warning" />
        <Stat label="Categories" value={new Set(rows.map(r => r.category)).size} tone="info" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SKU or name…"
            className="w-full h-9 rounded-lg border border-border/60 bg-card/60 pl-8 pr-3 text-sm" />
        </div>
        {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
        : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Package className="mx-auto h-8 w-8 mb-2" />
            {rows.length === 0 ? "No products yet." : "No matches."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">SKU</th><th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Category</th><th className="py-2 pr-3">UoM</th>
                <th className="py-2 pr-3">ABC</th><th className="py-2 pr-3">Min/Max</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="py-2.5 pr-3 font-mono text-xs text-primary">{r.sku}</td>
                  <td className="py-2.5 pr-3 text-xs">{r.name}{r.hazmat && <span className="ml-2 text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">HAZMAT</span>}</td>
                  <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{r.category ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-xs">{r.uom}</td>
                  <td className="py-2.5 pr-3 text-xs font-mono">{r.abc_class}</td>
                  <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{r.min_stock} / {r.max_stock}</td>
                  <td className="py-2.5 pr-3 text-right">
                    {canManage && (
                      <button onClick={async () => {
                        if (!confirm(`Delete ${r.sku}?`)) return;
                        const { error } = await supabase.from("products").delete().eq("id", r.id);
                        if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
                      }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProductForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ sku: "", name: "", category: "", uom: "EA", abc_class: "B", hazmat: false, min_stock: 0, max_stock: 0 });
  const [saving, setSaving] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from("products").insert(f);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Product created"); onDone();
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New product</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="SKU" value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value.toUpperCase() })} className="input" />
          <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
          <input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="input" />
          <select value={f.uom} onChange={(e) => setF({ ...f, uom: e.target.value })} className="input">
            <option>EA</option><option>KG</option><option>L</option><option>M</option><option>BOX</option><option>PLT</option>
          </select>
          <select value={f.abc_class} onChange={(e) => setF({ ...f, abc_class: e.target.value })} className="input">
            <option>A</option><option>B</option><option>C</option>
          </select>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.hazmat} onChange={(e) => setF({ ...f, hazmat: e.target.checked })} /> Hazmat</label>
          <input type="number" placeholder="Min stock" value={f.min_stock} onChange={(e) => setF({ ...f, min_stock: +e.target.value })} className="input" />
          <input type="number" placeholder="Max stock" value={f.max_stock} onChange={(e) => setF({ ...f, max_stock: +e.target.value })} className="input" />
        </div>
        <DialogFooter><button disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">{saving ? "Saving…" : "Create"}</button></DialogFooter>
      </form>
      <style>{`.input{width:100%;border-radius:.5rem;border:1px solid oklch(0.3 0.02 245/.6);background:oklch(0.16 0.02 245/.6);padding:.5rem .75rem;font-size:.8rem}`}</style>
    </DialogContent>
  );
}
