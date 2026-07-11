import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Warehouse, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat } from "@/components/status-pill";
import { useAuth } from "@/hooks/use-auth";
import { TableToolbar } from "@/components/table-toolbar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/warehouses")({
  head: () => ({ meta: [{ title: "Warehouses · CORTA WMS" }] }),
  component: WarehousesPage,
});

type WH = {
  id: string; code: string; name: string; city: string | null;
  country: string | null; timezone: string | null;
  width_m: number; length_m: number; status: string;
};

function WarehousesPage() {
  const { canManage } = useAuth();
  const [rows, setRows] = useState<WH[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("warehouses").select("*").order("code");
    if (error) toast.error(error.message);
    setRows((data ?? []) as WH[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this warehouse and all its layout data?")) return;
    const { error } = await supabase.from("warehouses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Warehouse removed");
    load();
  }

  return (
    <div>
      <PageHeader
        title="Warehouses"
        subtitle="Physical facilities with zones, aisles, racks and bins"
        actions={canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> New warehouse
              </button>
            </DialogTrigger>
            <NewWarehouseForm onDone={() => { setOpen(false); load(); }} />
          </Dialog>
        )}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Warehouses" value={rows.length} tone="primary" />
        <Stat label="Active" value={rows.filter(r => r.status === "active").length} tone="success" />
        <Stat label="Total area (m²)" value={rows.reduce((s, r) => s + r.width_m * r.length_m, 0).toLocaleString()} tone="info" />
        <Stat label="Countries" value={new Set(rows.map(r => r.country)).size} tone="accent" />
      </div>

      {loading ? (
        <div className="glass-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <Warehouse className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm">No warehouses yet.</p>
          {canManage && <p className="text-xs text-muted-foreground">Create your first warehouse to start defining zones and racks.</p>}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((w) => (
            <Link key={w.id} to="/warehouses/$id" params={{ id: w.id }}
              className="glass-panel group rounded-2xl p-4 hover:border-primary/40 transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-primary">{w.code}</div>
                  <div className="text-sm font-semibold">{w.name}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{w.city ?? "—"} · {w.country}</div>
                </div>
                {canManage && (
                  <button onClick={(e) => { e.preventDefault(); remove(w.id); }}
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                  <div className="font-mono text-sm">{w.width_m}×{w.length_m}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Dim (m)</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                  <div className="font-mono text-sm">{(w.width_m * w.length_m).toLocaleString()}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">m²</div>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                  <div className="font-mono text-[10px]">{w.timezone}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">TZ</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewWarehouseForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ code: "", name: "", city: "Riyadh", country: "SA", width_m: 80, length_m: 60 });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("warehouses").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Warehouse created");
    onDone();
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New warehouse</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code"><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input" placeholder="WH-01" /></Field>
          <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Riyadh DC" /></Field>
          <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></Field>
          <Field label="Country"><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} className="input" /></Field>
          <Field label="Width (m)"><input type="number" required value={form.width_m} onChange={(e) => setForm({ ...form, width_m: +e.target.value })} className="input" /></Field>
          <Field label="Length (m)"><input type="number" required value={form.length_m} onChange={(e) => setForm({ ...form, length_m: +e.target.value })} className="input" /></Field>
        </div>
        <DialogFooter>
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {saving ? "Saving…" : "Create warehouse"}
          </button>
        </DialogFooter>
      </form>
      <style>{`.input{width:100%;border-radius:.5rem;border:1px solid oklch(0.3 0.02 245/.6);background:oklch(0.16 0.02 245/.6);padding:.5rem .75rem;font-size:.8rem}`}</style>
    </DialogContent>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
