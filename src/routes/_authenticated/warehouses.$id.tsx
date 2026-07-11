import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat } from "@/components/status-pill";
import { WarehouseIso, type ZoneDef, type AisleDef, type RackDef, type BinDef } from "@/components/warehouse-iso";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/warehouses/$id")({
  head: () => ({ meta: [{ title: "Warehouse layout · CORTA WMS" }] }),
  component: WarehouseDetail,
});

type WH = { id: string; code: string; name: string; city: string | null; country: string | null; width_m: number; length_m: number; status: string };

function WarehouseDetail() {
  const { id } = useParams({ from: "/_authenticated/warehouses/$id" });
  const { canManage } = useAuth();
  const [wh, setWh] = useState<WH | null>(null);
  const [zones, setZones] = useState<ZoneDef[]>([]);
  const [aisles, setAisles] = useState<AisleDef[]>([]);
  const [racks, setRacks] = useState<RackDef[]>([]);
  const [bins, setBins] = useState<BinDef[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: w } = await supabase.from("warehouses").select("*").eq("id", id).maybeSingle();
    setWh(w as WH);
    const { data: z } = await supabase.from("zones").select("*").eq("warehouse_id", id);
    setZones((z ?? []) as ZoneDef[]);
    const zoneIds = (z ?? []).map((r) => r.id);
    if (zoneIds.length) {
      const { data: a } = await supabase.from("aisles").select("*").in("zone_id", zoneIds);
      setAisles((a ?? []) as AisleDef[]);
      const aisleIds = (a ?? []).map((r) => r.id);
      if (aisleIds.length) {
        const { data: r } = await supabase.from("racks").select("*").in("aisle_id", aisleIds);
        setRacks((r ?? []) as RackDef[]);
        const rackIds = (r ?? []).map((x) => x.id);
        if (rackIds.length) {
          const { data: b } = await supabase.from("bins").select("*").in("rack_id", rackIds);
          setBins((b ?? []) as BinDef[]);
        } else setBins([]);
      } else { setRacks([]); setBins([]); }
    } else { setAisles([]); setRacks([]); setBins([]); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  if (!wh) return (
    <div className="p-10 text-center text-sm">
      Warehouse not found. <Link to="/warehouses" className="text-primary underline">Back</Link>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`${wh.code} · ${wh.name}`}
        subtitle={`${wh.city ?? ""} ${wh.country ?? ""} · ${wh.width_m}m × ${wh.length_m}m · ${(wh.width_m * wh.length_m).toLocaleString()} m²`}
        actions={
          <Link to="/warehouses" className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <ChevronLeft className="h-3.5 w-3.5" /> All warehouses
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Zones" value={zones.length} tone="primary" />
        <Stat label="Aisles" value={aisles.length} tone="info" />
        <Stat label="Racks" value={racks.length} tone="accent" />
        <Stat label="Bins" value={bins.length} tone="success" />
        <Stat label="Occupied" value={bins.filter(b => b.status === "occupied").length} tone="warning" />
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
        <WarehouseIso widthM={wh.width_m} lengthM={wh.length_m} zones={zones} aisles={aisles} racks={racks} bins={bins} />
      )}

      {canManage && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ZoneManager warehouseId={id} zones={zones} onChange={load} />
          <RackManager zones={zones} aisles={aisles} racks={racks} onChange={load} />
          <BinManager racks={racks} bins={bins} onChange={load} />
        </div>
      )}
    </div>
  );
}

function QuickSeedButton({ warehouseId, onDone }: { warehouseId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function seed() {
    setBusy(true);
    try {
      // Seed 3 zones (storage, receiving, shipping), aisles, racks, bins
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
      const rackRows: any[] = [];
      for (const ai of aArr!) {
        for (let j = 0; j < 6; j++) {
          rackRows.push({ aisle_id: ai.id, code: `${ai.code}-${String(j + 1).padStart(2, "0")}`, x: ai.x, y: ai.y + j * 6, w: 3, d: 1.2, levels: 4 });
        }
      }
      const { data: rArr, error: re } = await supabase.from("racks").insert(rackRows).select();
      if (re) throw re;
      const binRows: any[] = [];
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
      toast.success(`Layout generated: ${zs!.length} zones · ${aArr!.length} aisles · ${rArr!.length} racks · ${binRows.length} bins`);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  return (
    <button onClick={seed} disabled={busy}
      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
      {busy ? "Generating…" : "Generate default layout"}
    </button>
  );
}

function ZoneManager({ warehouseId, zones, onChange }: { warehouseId: string; zones: ZoneDef[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ code: "", name: "", kind: "storage", color: "#22d3ee", x: 5, y: 5, w: 20, h: 15 });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("zones").insert({ ...f, warehouse_id: warehouseId });
    if (error) return toast.error(error.message);
    toast.success("Zone added"); setOpen(false); onChange();
  }
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Zones ({zones.length})</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><button className="text-xs text-primary flex items-center gap-1"><Plus className="h-3 w-3" />Add</button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New zone</DialogTitle></DialogHeader>
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
              <DialogFooter><button className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground">Create</button></DialogFooter>
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
            </span>
            <button onClick={async () => { await supabase.from("zones").delete().eq("id", z.id); onChange(); }}
              className="text-muted-foreground hover:text-destructive">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RackManager({ zones, aisles, racks, onChange }: { zones: ZoneDef[]; aisles: AisleDef[]; racks: RackDef[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [zoneId, setZoneId] = useState<string>("");
  const [f, setF] = useState({ aisleCode: "", rackCode: "", x: 10, y: 10, w: 3, d: 1.2, levels: 4 });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneId) return toast.error("Pick a zone");
    // ensure aisle
    let aisle = aisles.find((a) => a.zone_id === zoneId && a.code === f.aisleCode);
    if (!aisle) {
      const { data, error } = await supabase.from("aisles").insert({ zone_id: zoneId, code: f.aisleCode, x: f.x, y: f.y, length_m: 20, orientation: "y" }).select().single();
      if (error) return toast.error(error.message);
      aisle = data as AisleDef;
    }
    const { error } = await supabase.from("racks").insert({ aisle_id: aisle.id, code: f.rackCode, x: f.x, y: f.y, w: f.w, d: f.d, levels: f.levels });
    if (error) return toast.error(error.message);
    toast.success("Rack added"); setOpen(false); onChange();
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
        {racks.slice(0, 12).map((r) => (
          <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="font-mono text-primary">{r.code}</span>
            <span className="text-muted-foreground">{r.levels} lvl</span>
          </div>
        ))}
        {racks.length > 12 && <div className="text-[10px] text-muted-foreground pt-1">+ {racks.length - 12} more</div>}
      </div>
    </div>
  );
}

function BinManager({ racks, bins, onChange }: { racks: RackDef[]; bins: BinDef[]; onChange: () => void }) {
  const [rackId, setRackId] = useState<string>("");
  const rackBins = bins.filter((b) => b.rack_id === rackId);
  async function cycle(binId: string, cur: BinDef["status"]) {
    const next: BinDef["status"] = cur === "empty" ? "occupied" : cur === "occupied" ? "quality_hold" : cur === "quality_hold" ? "blocked" : "empty";
    await supabase.from("bins").update({ status: next }).eq("id", binId);
    onChange();
  }
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="text-sm font-semibold">Bins</div>
      <select value={rackId} onChange={(e) => setRackId(e.target.value)}
        className="mt-2 w-full rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-xs">
        <option value="">Pick a rack…</option>
        {racks.slice(0, 30).map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}
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
