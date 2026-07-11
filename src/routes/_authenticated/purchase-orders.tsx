import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, ClipboardList, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { TableToolbar } from "@/components/table-toolbar";

export const Route = createFileRoute("/_authenticated/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders · CORTA WMS" }] }),
  component: POPage,
});

type Row = { id: string; po_number: string; status: string; expected_at: string | null; total_value: number;
  suppliers: { code: string; name: string } | null; warehouses: { code: string } | null };

function POPage() {
  const { canManage } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("purchase_orders")
      .select("id, po_number, status, expected_at, total_value, suppliers(code,name), warehouses(code)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as any); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`PO → ${status}`); load(); }
  }

  return (
    <div>
      <PageHeader title="Purchase Orders" subtitle="Inbound orders from suppliers · receive against POs"
        actions={canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> New PO
              </button>
            </DialogTrigger>
            <POForm onDone={() => { setOpen(false); load(); }} />
          </Dialog>
        )} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total POs" value={rows.length} tone="primary" />
        <Stat label="Open" value={rows.filter(r => r.status === "open").length} tone="info" />
        <Stat label="Receiving" value={rows.filter(r => r.status === "receiving").length} tone="warning" />
        <Stat label="Value" value={`$${rows.reduce((s, r) => s + Number(r.total_value || 0), 0).toLocaleString()}`} tone="accent" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <TableToolbar
          q={q} onQ={setQ} placeholder="Search PO#, supplier, warehouse…"
          filterValue={statusFilter} onFilter={setStatusFilter}
          filterOptions={["draft","open","receiving","closed","cancelled"]} filterLabel="All statuses"
          exportName="purchase_orders"
          exportColumns={[
            { key: "po_number", label: "PO#" }, { key: "supplier", label: "Supplier" }, { key: "warehouse", label: "Warehouse" },
            { key: "expected_at", label: "Expected" }, { key: "total_value", label: "Value" }, { key: "status", label: "Status" },
          ]}
          exportRows={rows
            .filter((r) => {
              const s = q.toLowerCase();
              const mq = !q || r.po_number.toLowerCase().includes(s) || (r.suppliers?.name ?? "").toLowerCase().includes(s) || (r.warehouses?.code ?? "").toLowerCase().includes(s);
              return mq && (!statusFilter || r.status === statusFilter);
            })
            .map((r) => ({ po_number: r.po_number, supplier: r.suppliers?.name ?? "", warehouse: r.warehouses?.code ?? "", expected_at: r.expected_at ?? "", total_value: r.total_value, status: r.status }))}
        />
        {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
        : rows.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground"><ClipboardList className="mx-auto h-8 w-8 mb-2" />No purchase orders yet.</div>
        : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">PO#</th><th className="py-2 pr-3">Supplier</th>
              <th className="py-2 pr-3">Warehouse</th><th className="py-2 pr-3">Expected</th>
              <th className="py-2 pr-3 text-right">Value</th><th className="py-2 pr-3 text-right">Status</th>
              <th></th></tr></thead>
            <tbody>{rows
              .filter((r) => {
                const s = q.toLowerCase();
                const mq = !q || r.po_number.toLowerCase().includes(s) || (r.suppliers?.name ?? "").toLowerCase().includes(s) || (r.warehouses?.code ?? "").toLowerCase().includes(s);
                return mq && (!statusFilter || r.status === statusFilter);
              })
              .map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{r.po_number}</td>
                <td className="py-2.5 pr-3 text-xs">{r.suppliers?.name ?? "—"}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{r.warehouses?.code ?? "—"}</td>
                <td className="py-2.5 pr-3 text-[11px]">{r.expected_at ?? "—"}</td>
                <td className="py-2.5 pr-3 text-right font-mono">${Number(r.total_value).toLocaleString()}</td>
                <td className="py-2.5 pr-3 text-right">
                  {canManage ? (
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="text-[10px] bg-card/60 border border-border/60 rounded px-1.5 py-0.5">
                      {["draft","open","receiving","closed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <StatusPill status={r.status.toUpperCase()} />}
                </td>
                <td className="py-2.5 pl-2 text-right">
                  {canManage && (
                    <button onClick={async () => { if (!confirm("Delete PO?")) return;
                      await supabase.from("purchase_orders").delete().eq("id", r.id); load();
                    }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function POForm({ onDone }: { onDone: () => void }) {
  const [suppliers, setSuppliers] = useState<{ id: string; code: string; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; code: string }[]>([]);
  const [f, setF] = useState({ po_number: "", supplier_id: "", warehouse_id: "", status: "open", expected_at: "", total_value: 0 });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    (async () => {
      const [s, w] = await Promise.all([supabase.from("suppliers").select("id,code,name"), supabase.from("warehouses").select("id,code")]);
      setSuppliers((s.data ?? []) as any); setWarehouses((w.data ?? []) as any);
    })();
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload: any = { ...f, expected_at: f.expected_at || null, supplier_id: f.supplier_id || null, warehouse_id: f.warehouse_id || null };
    const { error } = await supabase.from("purchase_orders").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("PO created"); onDone();
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New purchase order</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="PO Number" value={f.po_number} onChange={(e) => setF({ ...f, po_number: e.target.value.toUpperCase() })} className="input" />
        <select value={f.supplier_id} onChange={(e) => setF({ ...f, supplier_id: e.target.value })} className="input">
          <option value="">Supplier (optional)…</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
        </select>
        <select value={f.warehouse_id} onChange={(e) => setF({ ...f, warehouse_id: e.target.value })} className="input">
          <option value="">Warehouse…</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.code}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={f.expected_at} onChange={(e) => setF({ ...f, expected_at: e.target.value })} className="input" />
          <input type="number" placeholder="Total value" value={f.total_value} onChange={(e) => setF({ ...f, total_value: +e.target.value })} className="input" />
        </div>
        <DialogFooter><button disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">{saving ? "Saving…" : "Create"}</button></DialogFooter>
      </form>
      <style>{`.input{width:100%;border-radius:.5rem;border:1px solid oklch(0.3 0.02 245/.6);background:oklch(0.16 0.02 245/.6);padding:.5rem .75rem;font-size:.8rem}`}</style>
    </DialogContent>
  );
}
