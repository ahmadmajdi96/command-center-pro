import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Stat } from "@/components/status-pill";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, downloadPDF, type Column } from "@/lib/reports-export";
import { Download, FileText, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit Log · CORTA WMS" }] }),
  component: AuditPage,
});

type Row = { id: string; actor_email: string | null; entity: string; entity_id: string | null; action: string; created_at: string; metadata: unknown };

function AuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");

  async function load() {
    setLoading(true);
    let q = supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(1000);
    if (from) q = q.gte("created_at", from);
    if (to) q = q.lte("created_at", to);
    if (entity) q = q.eq("entity", entity);
    if (action) q = q.eq("action", action);
    const { data } = await q;
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [from, to, entity, action]);

  const columns: Column[] = [
    { key: "created_at", label: "When" },
    { key: "actor_email", label: "Actor" },
    { key: "entity", label: "Entity" },
    { key: "action", label: "Action" },
    { key: "entity_id", label: "Entity ID" },
    { key: "metadata", label: "Metadata", format: (v) => JSON.stringify(v ?? {}) },
  ];

  const entities = Array.from(new Set(rows.map((r) => r.entity))).sort();
  const actions = Array.from(new Set(rows.map((r) => r.action))).sort();

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Immutable trail of user and system actions" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Events" value={rows.length} tone="primary" />
        <Stat label="Entities" value={new Set(rows.map((r) => r.entity)).size} tone="info" />
        <Stat label="Actors" value={new Set(rows.map((r) => r.actor_email)).size} tone="accent" />
        <Stat label="Actions" value={new Set(rows.map((r) => r.action)).size} tone="success" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">From</span><input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">To</span><input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">Entity</span>
            <select value={entity} onChange={(e) => setEntity(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm"><option value="">All</option>{entities.map((e) => <option key={e}>{e}</option>)}</select>
          </label>
          <label className="text-xs space-y-1"><span className="text-muted-foreground block">Action</span>
            <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-lg border border-border/60 bg-card/60 px-2 py-1.5 text-sm"><option value="">All</option>{actions.map((a) => <option key={a}>{a}</option>)}</select>
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => downloadCSV("audit_log", columns, rows as unknown as Record<string, unknown>[])} className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> CSV</button>
            <button onClick={() => downloadPDF("audit_log", "Audit Log", columns, rows as unknown as Record<string, unknown>[], { from, to })} className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> PDF</button>
          </div>
        </div>
        {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
        : rows.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No events.</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">When</th><th className="py-2 pr-3">Actor</th><th className="py-2 pr-3">Entity</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">ID</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/40">
                    <td className="py-2 pr-3 font-mono text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3 text-xs">{r.actor_email ?? "system"}</td>
                    <td className="py-2 pr-3 text-xs font-mono text-primary">{r.entity}</td>
                    <td className="py-2 pr-3 text-xs">{r.action}</td>
                    <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">{r.entity_id?.slice(0, 8) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
