import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line as RLine, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Download, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat } from "@/components/status-pill";
import { downloadCSV, downloadPDF, type Column } from "@/lib/reports-export";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports · CORTA WMS" }] }),
  component: ReportsPage,
});

const tooltipStyle = { background: "oklch(0.16 0.02 240 / 0.95)", border: "1px solid oklch(0.3 0.02 245)", borderRadius: 8, fontSize: 12 };

type Dataset = "inventory" | "purchase_orders" | "sales_orders" | "shipments" | "receiving_orders" | "quality_holds" | "cycle_counts" | "audit_log";

const DATASETS: { value: Dataset; label: string; dateField: string; select?: string }[] = [
  { value: "inventory", label: "Inventory snapshot", dateField: "updated_at" },
  { value: "purchase_orders", label: "Purchase orders", dateField: "created_at" },
  { value: "sales_orders", label: "Sales orders", dateField: "created_at" },
  { value: "shipments", label: "Shipments", dateField: "created_at" },
  { value: "receiving_orders", label: "Receiving", dateField: "created_at" },
  { value: "quality_holds", label: "Quality holds", dateField: "created_at" },
  { value: "cycle_counts", label: "Cycle counts", dateField: "created_at" },
  { value: "audit_log", label: "Audit log", dateField: "created_at" },
];

function ReportsPage() {
  const [dataset, setDataset] = useState<Dataset>("sales_orders");
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({ inbound: 0, outbound: 0, holds: 0, shipments: 0 });

  const cfg = DATASETS.find((d) => d.value === dataset)!;

  async function load() {
    setLoading(true);
    let q = supabase.from(dataset as never).select("*").order(cfg.dateField as never, { ascending: false }).limit(2000);
    if (from) q = q.gte(cfg.dateField, new Date(from).toISOString()) as never;
    if (to) q = q.lte(cfg.dateField, new Date(to + "T23:59:59").toISOString()) as never;
    if (status) q = q.eq("status" as never, status as never) as never;
    const { data, error } = await q as any;
    if (error) console.error(error);
    setRows((data ?? []) as Record<string, unknown>[]);
    setLoading(false);
  }

  async function loadKpis() {
    const since = new Date(from).toISOString();
    const until = new Date(to + "T23:59:59").toISOString();
    const [po, so, qh, sh] = await Promise.all([
      supabase.from("purchase_orders").select("id", { count: "exact", head: true }).gte("created_at", since).lte("created_at", until),
      supabase.from("sales_orders").select("id", { count: "exact", head: true }).gte("created_at", since).lte("created_at", until),
      supabase.from("quality_holds").select("id", { count: "exact", head: true }).gte("created_at", since).lte("created_at", until),
      supabase.from("shipments").select("id", { count: "exact", head: true }).gte("created_at", since).lte("created_at", until),
    ]);
    setKpi({ inbound: po.count ?? 0, outbound: so.count ?? 0, holds: qh.count ?? 0, shipments: sh.count ?? 0 });
  }

  useEffect(() => { load(); }, [dataset, from, to, status]);
  useEffect(() => { loadKpis(); }, [from, to]);

  const columns: Column[] = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).filter((k) => k !== "id").map((k) => ({ key: k, label: k, format: (v) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)) }));
  }, [rows]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = String((r as any)[cfg.dateField] ?? "").slice(0, 10);
      if (d) map.set(d, (map.get(d) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count }));
  }, [rows, cfg.dateField]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const s = String((r as any).status ?? "n/a");
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    const colors = ["oklch(0.78 0.16 195)", "oklch(0.78 0.18 75)", "oklch(0.72 0.18 155)", "oklch(0.66 0.22 25)", "oklch(0.7 0.16 265)", "oklch(0.7 0.18 320)"];
    return Array.from(map.entries()).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [rows]);

  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => String((r as any).status ?? "")).filter(Boolean))), [rows]);

  return (
    <div>
      <PageHeader
        title="Reports & Dashboards"
        subtitle="Filter by date range and status, then export to CSV or PDF"
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Inbound POs" value={kpi.inbound} tone="primary" />
        <Stat label="Sales orders" value={kpi.outbound} tone="info" />
        <Stat label="Shipments" value={kpi.shipments} tone="accent" />
        <Stat label="Holds" value={kpi.holds} tone={kpi.holds > 0 ? "warning" : "success"} />
      </div>

      <div className="glass-panel mb-4 rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground block">Dataset</span>
            <select value={dataset} onChange={(e) => { setDataset(e.target.value as Dataset); setStatus(""); }} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm">
              {DATASETS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm">
              <option value="">All</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{rows.length} rows</span>
            <button onClick={() => downloadCSV(`${dataset}_${from}_${to}`, columns, rows)} className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> CSV</button>
            <button onClick={() => downloadPDF(`${dataset}_${from}_${to}`, cfg.label, columns, rows, { from, to, subtitle: `Status: ${status || "all"}` })} className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> PDF</button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">{cfg.label} · per day</h3>
          <div className="mt-3 h-64">
            {loading ? <Loader2 className="mx-auto mt-24 h-4 w-4 animate-spin" /> : (
              <ResponsiveContainer>
                <AreaChart data={byDay}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                  <XAxis dataKey="day" stroke="oklch(0.68 0.02 245)" fontSize={10} />
                  <YAxis stroke="oklch(0.68 0.02 245)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="oklch(0.78 0.16 195)" fill="url(#g)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">By status</h3>
          <div className="mt-3 h-64">
            {byStatus.length === 0 ? <div className="text-center pt-24 text-xs text-muted-foreground">No status data</div> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2} label={(e) => e.name}>
                    {byStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Volume trend</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 245)" fontSize={10} />
                <YAxis stroke="oklch(0.68 0.02 245)" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="oklch(0.78 0.18 75)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
