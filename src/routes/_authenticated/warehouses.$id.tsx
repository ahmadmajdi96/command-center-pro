import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Plus, Layers, Loader2, Search, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat } from "@/components/status-pill";
import { WarehouseIso, type ZoneDef, type AisleDef, type RackDef, type BinDef } from "@/components/warehouse-iso";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CategoryPie, BarCard, TrendCard } from "@/components/mini-analytics";

export const Route = createFileRoute("/_authenticated/warehouses/$id")({
  head: () => ({ meta: [{ title: "Warehouse layout · CORTA WMS" }] }),
  component: WarehouseDetail,
});

type WH = { id: string; code: string; name: string; city: string | null; country: string | null; width_m: number; length_m: number; status: string };

const LOG = (...args: unknown[]) => console.log("[warehouse-viz]", ...args);
const WARN = (...args: unknown[]) => console.warn("[warehouse-viz]", ...args);
const ERR = (...args: unknown[]) => console.error("[warehouse-viz]", ...args);

function WarehouseDetail() {
  const { id } = useParams({ from: "/_authenticated/warehouses/$id" });
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [allWarehouses, setAllWarehouses] = useState<WH[]>([]);
  const [wh, setWh] = useState<WH | null>(null);
  const [zones, setZones] = useState<ZoneDef[]>([]);
  const [aisles, setAisles] = useState<AisleDef[]>([]);
  const [racks, setRacks] = useState<RackDef[]>([]);
  const [bins, setBins] = useState<BinDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{ inv: Record<string, unknown>[]; sos: Record<string, unknown>[]; pos: Record<string, unknown>[] }>({ inv: [], sos: [], pos: [] });

  // Controls
  const [q, setQ] = useState("");
  const [zoneKindFilter, setZoneKindFilter] = useState<string>("");
  const [binStatusFilter, setBinStatusFilter] = useState<string>("");
  const [editMode, setEditMode] = useState(false);

  async function loadWarehousesList() {
    const t = performance.now();
    const { data, error } = await supabase.from("warehouses").select("id,code,name,city,country,width_m,length_m,status").order("code");
    if (error) {
      ERR("failed to list warehouses", error);
      return;
    }
    LOG(`warehouses list loaded in ${Math.round(performance.now() - t)}ms · ${data?.length ?? 0} rows`);
    setAllWarehouses((data ?? []) as WH[]);
  }

  async function load() {
    setLoading(true);
    setLoadError(null);
    const start = performance.now();
    LOG("loading layout for warehouse", id);
    try {
      const { data: w, error: we } = await supabase.from("warehouses").select("*").eq("id", id).maybeSingle();
      if (we) throw we;
      if (!w) {
        WARN("warehouse row not found for id", id);
        setWh(null);
        setZones([]); setAisles([]); setRacks([]); setBins([]);
        setLoading(false);
        return;
      }
      setWh(w as WH);
      LOG("warehouse:", { id: w.id, code: w.code, dims: `${w.width_m}x${w.length_m}` });

      const { data: z, error: ze } = await supabase.from("zones").select("*").eq("warehouse_id", id).order("code");
      if (ze) throw ze;
      setZones((z ?? []) as ZoneDef[]);
      LOG(`zones · ${z?.length ?? 0}`);

      const zoneIds = (z ?? []).map((r) => r.id);
      if (!zoneIds.length) {
        setAisles([]); setRacks([]); setBins([]);
        WARN("no zones defined — layout empty");
        setLoading(false);
        LOG(`load done in ${Math.round(performance.now() - start)}ms`);
        return;
      }

      const { data: a, error: ae } = await supabase.from("aisles").select("*").in("zone_id", zoneIds).order("code");
      if (ae) throw ae;
      setAisles((a ?? []) as AisleDef[]);
      LOG(`aisles · ${a?.length ?? 0}`);

      const aisleIds = (a ?? []).map((r) => r.id);
      if (!aisleIds.length) {
        setRacks([]); setBins([]);
        setLoading(false);
        LOG(`load done in ${Math.round(performance.now() - start)}ms`);
        return;
      }

      const { data: r, error: re } = await supabase.from("racks").select("*").in("aisle_id", aisleIds).order("code");
      if (re) throw re;
      setRacks((r ?? []) as RackDef[]);
      LOG(`racks · ${r?.length ?? 0}`);

      const rackIds = (r ?? []).map((x) => x.id);
      if (!rackIds.length) { setBins([]); setLoading(false); return; }

      const { data: b, error: be } = await supabase.from("bins").select("*").in("rack_id", rackIds);
      if (be) throw be;
      setBins((b ?? []) as BinDef[]);
      LOG(`bins · ${b?.length ?? 0}`);
      LOG(`load done in ${Math.round(performance.now() - start)}ms`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      ERR("layout load failed", e);
      setLoadError(msg);
      toast.error(`Layout load failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWarehousesList(); }, []);
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    (async () => {
      const [inv, sos, pos] = await Promise.all([
        supabase.from("inventory").select("id, qty, status, products(sku,name)").eq("warehouse_id", id).limit(500),
        supabase.from("sales_orders").select("id, status, total_value, created_at").eq("warehouse_id", id).order("created_at", { ascending: false }).limit(500),
        supabase.from("purchase_orders").select("id, status, total_value, created_at").eq("warehouse_id", id).order("created_at", { ascending: false }).limit(500),
      ]);
      setAnalytics({
        inv: (inv.data ?? []) as unknown as Record<string, unknown>[],
        sos: (sos.data ?? []) as Record<string, unknown>[],
        pos: (pos.data ?? []) as Record<string, unknown>[],
      });
    })();
  }, [id]);

  // Filters
  const filteredZones = useMemo(() => {
    const s = q.toLowerCase();
    return zones.filter((z) => {
      const mq = !q || z.code.toLowerCase().includes(s) || z.name.toLowerCase().includes(s);
      const mk = !zoneKindFilter || z.kind === zoneKindFilter;
      return mq && mk;
    });
  }, [zones, q, zoneKindFilter]);

  const filteredZoneIds = useMemo(() => new Set(filteredZones.map((z) => z.id)), [filteredZones]);
  const filteredAisles = useMemo(() => aisles.filter((a) => filteredZoneIds.has(a.zone_id)), [aisles, filteredZoneIds]);
  const filteredAisleIds = useMemo(() => new Set(filteredAisles.map((a) => a.id)), [filteredAisles]);

  const filteredRacks = useMemo(() => {
    const s = q.toLowerCase();
    return racks.filter((r) => {
      if (!filteredAisleIds.has(r.aisle_id)) return false;
      if (!q) return true;
      return r.code.toLowerCase().includes(s);
    });
  }, [racks, filteredAisleIds, q]);

  const filteredRackIds = useMemo(() => new Set(filteredRacks.map((r) => r.id)), [filteredRacks]);

  const filteredBins = useMemo(() => bins.filter((b) => {
    if (!filteredRackIds.has(b.rack_id)) return false;
    if (binStatusFilter && b.status !== binStatusFilter) return false;
    return true;
  }), [bins, filteredRackIds, binStatusFilter]);

  useEffect(() => {
    LOG("filters applied", {
      q, zoneKindFilter, binStatusFilter,
      visible: { zones: filteredZones.length, aisles: filteredAisles.length, racks: filteredRacks.length, bins: filteredBins.length },
    });
  }, [q, zoneKindFilter, binStatusFilter, filteredZones.length, filteredAisles.length, filteredRacks.length, filteredBins.length]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  if (loadError) return (
    <div className="glass-panel m-4 rounded-2xl p-6 text-sm">
      <p className="font-semibold text-destructive">Failed to load layout</p>
      <p className="mt-1 text-xs text-muted-foreground font-mono break-all">{loadError}</p>
      <button onClick={load} className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">Retry</button>
    </div>
  );
  if (!wh) return (
    <div className="p-10 text-center text-sm">
      Warehouse not found. <Link to="/warehouses" className="text-primary underline">Back</Link>
    </div>
  );

  const zoneKinds = Array.from(new Set(zones.map((z) => z.kind))).sort();

  return (
    <div>
      <PageHeader
        title={`${wh.code} · ${wh.name}`}
        subtitle={`${wh.city ?? ""} ${wh.country ?? ""} · ${wh.width_m}m × ${wh.length_m}m · ${(wh.width_m * wh.length_m).toLocaleString()} m²`}
        actions={
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={() => { setEditMode((v) => !v); LOG("editMode ->", !editMode); }}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
                  editMode ? "border-primary/60 bg-primary/10 text-primary" : "border-border/60 bg-card/60"
                }`}
              >
                {editMode ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {editMode ? "Edit mode" : "View mode"}
              </button>
            )}
            <Link to="/warehouses" className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
              <ChevronLeft className="h-3.5 w-3.5" /> All warehouses
            </Link>
          </div>
        }
      />

      {/* Controls */}
      <div className="glass-panel mb-4 rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Warehouse</span>
          <select
            value={id}
            onChange={(e) => {
              LOG("switch warehouse ->", e.target.value);
              navigate({ to: "/warehouses/$id", params: { id: e.target.value } });
            }}
            className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-xs min-w-[220px]"
          >
            {allWarehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.code} · {w.name}</option>
            ))}
          </select>
        </label>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search zones, racks…"
            className="rounded-lg border border-border/60 bg-card/60 pl-7 pr-2 py-1.5 text-xs w-56"
          />
        </div>

        <select value={zoneKindFilter} onChange={(e) => setZoneKindFilter(e.target.value)}
          className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-xs">
          <option value="">All zone kinds</option>
          {zoneKinds.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>

        <select value={binStatusFilter} onChange={(e) => setBinStatusFilter(e.target.value)}
          className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-xs">
          <option value="">All bin statuses</option>
          <option value="empty">Empty</option>
          <option value="occupied">Occupied</option>
          <option value="quality_hold">Quality hold</option>
          <option value="blocked">Blocked</option>
        </select>

        {(q || zoneKindFilter || binStatusFilter) && (
          <button onClick={() => { setQ(""); setZoneKindFilter(""); setBinStatusFilter(""); }}
            className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
        )}

        <div className="ml-auto text-[11px] text-muted-foreground">
          Showing {filteredRacks.length}/{racks.length} racks · {filteredBins.length}/{bins.length} bins
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Zones" value={`${filteredZones.length}/${zones.length}`} tone="primary" />
        <Stat label="Aisles" value={`${filteredAisles.length}/${aisles.length}`} tone="info" />
        <Stat label="Racks" value={`${filteredRacks.length}/${racks.length}`} tone="accent" />
        <Stat label="Bins" value={`${filteredBins.length}/${bins.length}`} tone="success" />
        <Stat label="Occupied" value={filteredBins.filter(b => b.status === "occupied").length} tone="warning" />
      </div>

      {racks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <Layers className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No layout defined yet</p>
          <p className="text-xs text-muted-foreground">Add zones, aisles and racks so the isometric view can render the physical structure.</p>
          {canManage && <div className="mt-4 flex justify-center gap-2">
            <QuickSeedButton warehouseId={id} onDone={load} />
          </div>}
        </div>
      ) : (
        <WarehouseIso
          widthM={wh.width_m}
          lengthM={wh.length_m}
          zones={filteredZones}
          aisles={filteredAisles}
          racks={filteredRacks}
          bins={filteredBins}
          onSelectRack={(rid) => {
            LOG("rack clicked", rid);
            if (editMode && isAdmin) {
              if (confirm("Delete this rack and its bins?")) {
                supabase.from("racks").delete().eq("id", rid).then(({ error }) => {
                  if (error) { ERR("rack delete failed", error); toast.error(error.message); }
                  else { toast.success("Rack removed"); load(); }
                });
              }
            }
          }}
        />
      )}

      {canManage && editMode && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ZoneManager warehouseId={id} zones={zones} onChange={load} isAdmin={isAdmin} />
          <RackManager zones={zones} aisles={aisles} racks={racks} onChange={load} isAdmin={isAdmin} />
          <BinManager racks={racks} bins={bins} onChange={load} />
        </div>
      )}

      {canManage && !editMode && racks.length > 0 && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Toggle <span className="text-primary">Edit mode</span> to add or remove zones, racks and bins.
        </p>
      )}
    </div>
  );
}

function QuickSeedButton({ warehouseId, onDone }: { warehouseId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function seed() {
    setBusy(true);
    LOG("seeding default layout for", warehouseId);
    try {
      const zonesToInsert = [
        { warehouse_id: warehouseId, code: "STG", name: "Storage", kind: "storage", color: "#22d3ee", x: 5, y: 8, w: 60, h: 40 },
        { warehouse_id: warehouseId, code: "RCV", name: "Receiving", kind: "receiving", color: "#f59e0b", x: 5, y: 2, w: 60, h: 5 },
        { warehouse_id: warehouseId, code: "SHP", name: "Shipping", kind: "shipping", color: "#10b981", x: 5, y: 50, w: 60, h: 5 },
      ];
      const { data: zs, error: ze } = await supabase.from("zones").insert(zonesToInsert).select();
      if (ze) throw ze;
      const stg = zs!.find((z) => z.code === "STG")!;
      const aisleRows = Array.from({ length: 4 }).map((_, i) => ({
        zone_id: stg.id, code: `A${i + 1}`, x: 10 + i * 12, y: 10, length_m: 36, orientation: "y" as const,
      }));
      const { data: aArr, error: ae } = await supabase.from("aisles").insert(aisleRows).select();
      if (ae) throw ae;
      const rackRows: { aisle_id: string; code: string; x: number; y: number; w: number; d: number; levels: number }[] = [];
      for (const ai of aArr!) {
        for (let j = 0; j < 6; j++) {
          rackRows.push({ aisle_id: ai.id, code: `${ai.code}-${String(j + 1).padStart(2, "0")}`, x: ai.x, y: ai.y + j * 6, w: 3, d: 1.2, levels: 4 });
        }
      }
      const { data: rArr, error: re } = await supabase.from("racks").insert(rackRows).select();
      if (re) throw re;
      const binRows: { rack_id: string; code: string; level: number; position: number; status: string }[] = [];
      for (const r of rArr!) {
        for (let l = 1; l <= r.levels; l++) {
          for (let p = 1; p <= 2; p++) {
            const rnd = Math.random();
            const status = rnd < 0.5 ? "occupied" : rnd < 0.85 ? "empty" : rnd < 0.95 ? "quality_hold" : "blocked";
            binRows.push({ rack_id: r.id, code: `${r.code}-L${l}-P${p}`, level: l, position: p, status });
          }
        }
      }
      await supabase.from("bins").insert(binRows);
      LOG("seed complete", { zones: zs!.length, aisles: aArr!.length, racks: rArr!.length, bins: binRows.length });
      toast.success(`Layout generated: ${zs!.length} zones · ${aArr!.length} aisles · ${rArr!.length} racks · ${binRows.length} bins`);
      onDone();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      ERR("seed failed", e);
      toast.error(msg);
    }
    finally { setBusy(false); }
  }
  return (
    <button onClick={seed} disabled={busy}
      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
      {busy ? "Generating…" : "Generate default layout"}
    </button>
  );
}

function ZoneManager({ warehouseId, zones, onChange, isAdmin }: { warehouseId: string; zones: ZoneDef[]; onChange: () => void; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ZoneDef | null>(null);
  const [f, setF] = useState({ code: "", name: "", kind: "storage", color: "#22d3ee", x: 5, y: 5, w: 20, h: 15 });

  function startEdit(z: ZoneDef) {
    setEditing(z);
    setF({ code: z.code, name: z.name, kind: z.kind, color: z.color ?? "#22d3ee", x: z.x, y: z.y, w: z.w, h: z.h });
    setOpen(true);
  }
  function startCreate() {
    setEditing(null);
    setF({ code: "", name: "", kind: "storage", color: "#22d3ee", x: 5, y: 5, w: 20, h: 15 });
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from("zones").update(f).eq("id", editing.id);
      if (error) { ERR("zone update failed", error); return toast.error(error.message); }
      toast.success("Zone updated");
    } else {
      const { error } = await supabase.from("zones").insert({ ...f, warehouse_id: warehouseId });
      if (error) { ERR("zone insert failed", error); return toast.error(error.message); }
      toast.success("Zone added");
    }
    setOpen(false); onChange();
  }
  async function del(z: ZoneDef) {
    if (!confirm(`Delete zone ${z.code}? All aisles, racks and bins inside will be removed.`)) return;
    const { error } = await supabase.from("zones").delete().eq("id", z.id);
    if (error) { ERR("zone delete failed", error); return toast.error(error.message); }
    toast.success("Zone removed"); onChange();
  }
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Zones ({zones.length})</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><button onClick={startCreate} className="text-xs text-primary flex items-center gap-1"><Plus className="h-3 w-3" />Add</button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? `Edit zone ${editing.code}` : "New zone"}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} className="input" />
                <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
                <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className="input">
                  <option value="storage">Storage</option><option value="receiving">Receiving</option>
                  <option value="shipping">Shipping</option><option value="quality">Quality</option><option value="staging">Staging</option>
                </select>
                <input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} className="input h-9" />
                <input type="number" placeholder="X" value={f.x} onChange={(e) => setF({ ...f, x: +e.target.value })} className="input" />
                <input type="number" placeholder="Y" value={f.y} onChange={(e) => setF({ ...f, y: +e.target.value })} className="input" />
                <input type="number" placeholder="Width (m)" value={f.w} onChange={(e) => setF({ ...f, w: +e.target.value })} className="input" />
                <input type="number" placeholder="Height (m)" value={f.h} onChange={(e) => setF({ ...f, h: +e.target.value })} className="input" />
              </div>
              <DialogFooter><button className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">{editing ? "Save" : "Create"}</button></DialogFooter>
            </form>
            <style>{`.input{width:100%;border-radius:.4rem;border:1px solid oklch(0.3 0.02 245/.6);background:oklch(0.16 0.02 245/.6);padding:.4rem .5rem;font-size:.75rem}`}</style>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-2 max-h-40 overflow-auto space-y-1">
        {zones.map((z) => (
          <div key={z.id} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded" style={{ background: z.color || "#22d3ee" }} />
              <span className="font-mono text-primary">{z.code}</span>
              <span className="text-muted-foreground">{z.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{z.kind}</span>
            </span>
            <span className="flex items-center gap-1">
              <button onClick={() => startEdit(z)} className="text-muted-foreground hover:text-primary p-0.5"><Pencil className="h-3 w-3" /></button>
              {isAdmin && (
                <button onClick={() => del(z)} className="text-muted-foreground hover:text-destructive p-0.5"><Trash2 className="h-3 w-3" /></button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RackManager({ zones, aisles, racks, onChange, isAdmin }: { zones: ZoneDef[]; aisles: AisleDef[]; racks: RackDef[]; onChange: () => void; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [zoneId, setZoneId] = useState<string>("");
  const [f, setF] = useState({ aisleCode: "", rackCode: "", x: 10, y: 10, w: 3, d: 1.2, levels: 4 });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneId) return toast.error("Pick a zone");
    let aisle = aisles.find((a) => a.zone_id === zoneId && a.code === f.aisleCode);
    if (!aisle) {
      const { data, error } = await supabase.from("aisles").insert({ zone_id: zoneId, code: f.aisleCode, x: f.x, y: f.y, length_m: 20, orientation: "y" }).select().single();
      if (error) { ERR("aisle insert failed", error); return toast.error(error.message); }
      aisle = data as AisleDef;
      LOG("aisle created", aisle);
    }
    const { error } = await supabase.from("racks").insert({ aisle_id: aisle.id, code: f.rackCode, x: f.x, y: f.y, w: f.w, d: f.d, levels: f.levels });
    if (error) { ERR("rack insert failed", error); return toast.error(error.message); }
    toast.success("Rack added"); setOpen(false); onChange();
  }
  async function delRack(r: RackDef) {
    if (!confirm(`Delete rack ${r.code}?`)) return;
    const { error } = await supabase.from("racks").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Rack removed"); onChange();
  }
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Racks ({racks.length})</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><button className="text-xs text-primary flex items-center gap-1"><Plus className="h-3 w-3" />Add</button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New rack</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-2">
              <select required value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="input">
                <option value="">Zone…</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.code} · {z.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Aisle code (e.g. A1)" value={f.aisleCode} onChange={(e) => setF({ ...f, aisleCode: e.target.value.toUpperCase() })} className="input" />
                <input required placeholder="Rack code (e.g. A1-01)" value={f.rackCode} onChange={(e) => setF({ ...f, rackCode: e.target.value.toUpperCase() })} className="input" />
                <input type="number" placeholder="X" value={f.x} onChange={(e) => setF({ ...f, x: +e.target.value })} className="input" />
                <input type="number" placeholder="Y" value={f.y} onChange={(e) => setF({ ...f, y: +e.target.value })} className="input" />
                <input type="number" placeholder="Width" value={f.w} step="0.1" onChange={(e) => setF({ ...f, w: +e.target.value })} className="input" />
                <input type="number" placeholder="Depth" value={f.d} step="0.1" onChange={(e) => setF({ ...f, d: +e.target.value })} className="input" />
                <input type="number" placeholder="Levels" value={f.levels} onChange={(e) => setF({ ...f, levels: +e.target.value })} className="input" />
              </div>
              <DialogFooter><button className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">Create</button></DialogFooter>
            </form>
            <style>{`.input{width:100%;border-radius:.4rem;border:1px solid oklch(0.3 0.02 245/.6);background:oklch(0.16 0.02 245/.6);padding:.4rem .5rem;font-size:.75rem}`}</style>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-2 max-h-40 overflow-auto space-y-1 text-xs">
        {racks.slice(0, 20).map((r) => (
          <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="font-mono text-primary">{r.code}</span>
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">{r.levels} lvl</span>
              {isAdmin && (
                <button onClick={() => delRack(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              )}
            </span>
          </div>
        ))}
        {racks.length > 20 && <div className="text-[10px] text-muted-foreground pt-1">+ {racks.length - 20} more</div>}
      </div>
    </div>
  );
}

function BinManager({ racks, bins, onChange }: { racks: RackDef[]; bins: BinDef[]; onChange: () => void }) {
  const [rackId, setRackId] = useState<string>("");
  const rackBins = bins.filter((b) => b.rack_id === rackId);
  async function cycle(binId: string, cur: BinDef["status"]) {
    const next: BinDef["status"] = cur === "empty" ? "occupied" : cur === "occupied" ? "quality_hold" : cur === "quality_hold" ? "blocked" : "empty";
    LOG("bin cycle", binId, cur, "->", next);
    const { error } = await supabase.from("bins").update({ status: next }).eq("id", binId);
    if (error) { ERR("bin update failed", error); toast.error(error.message); return; }
    onChange();
  }
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="text-sm font-semibold">Bins</div>
      <select value={rackId} onChange={(e) => setRackId(e.target.value)}
        className="mt-2 w-full rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-xs">
        <option value="">Pick a rack…</option>
        {racks.slice(0, 60).map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}
      </select>
      <div className="mt-2 max-h-40 overflow-auto space-y-1 text-xs">
        {rackBins.map((b) => (
          <button key={b.id} onClick={() => cycle(b.id, b.status)}
            className="w-full flex items-center justify-between py-1 border-b border-border/40 last:border-0 hover:bg-card/30 px-1 rounded">
            <span className="font-mono">{b.code}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
              background: b.status === "occupied" ? "oklch(0.72 0.18 155 / .2)"
                : b.status === "quality_hold" ? "oklch(0.78 0.18 75 / .2)"
                : b.status === "blocked" ? "oklch(0.55 0.22 25 / .2)" : "oklch(0.35 0.02 245 / .3)",
              color: b.status === "occupied" ? "oklch(0.85 0.18 155)"
                : b.status === "quality_hold" ? "oklch(0.85 0.18 75)"
                : b.status === "blocked" ? "oklch(0.85 0.22 25)" : "oklch(0.7 0.02 245)"
            }}>{b.status}</span>
          </button>
        ))}
        {rackId && rackBins.length === 0 && <div className="text-[10px] text-muted-foreground">No bins in this rack.</div>}
      </div>
    </div>
  );
}
