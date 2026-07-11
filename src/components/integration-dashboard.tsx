import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";
import { supabase } from "@/integrations/supabase/client";

export type IntegrationSystem = "mes" | "qms" | "oms" | "cmms" | "qc_system" | "command_center";

const LABEL: Record<IntegrationSystem, string> = {
  mes: "MES", qms: "QMS", oms: "OMS", cmms: "CMMS",
  qc_system: "CORTA QC System", command_center: "Command Center Pro",
};

export function IntegrationDashboard({ system, subtitle }: { system: IntegrationSystem; subtitle: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    setLoading(true);
    const [ev, rn] = await Promise.all([
      supabase.from("integration_events").select("*").eq("system", system).order("created_at", { ascending: false }).limit(50),
      supabase.from("integration_sync_runs").select("*").eq("system", system).order("started_at", { ascending: false }).limit(20),
    ]);
    setEvents(ev.data ?? []); setRuns(rn.data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [system]);

  async function triggerSync() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/public/hooks/sync-${system}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`${LABEL[system]} sync triggered`);
      setTimeout(load, 800);
    } catch (e) { toast.error((e as Error).message); }
    finally { setSyncing(false); }
  }

  const lastRun = runs[0];
  const successCount = runs.filter((r) => r.status === "success").length;
  const errorCount = runs.filter((r) => r.status === "error").length;

  return (
    <div>
      <PageHeader
        title={`${LABEL[system]} Integration`}
        subtitle={subtitle}
        actions={
          <button onClick={triggerSync} disabled={syncing} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync now
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Events (recent)" value={events.length} tone="primary" />
        <Stat label="Sync runs" value={runs.length} tone="info" />
        <Stat label="Successful" value={successCount} tone="success" />
        <Stat label="Errors" value={errorCount} tone={errorCount > 0 ? "destructive" : "accent"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-primary" /><span className="font-semibold">Recent events</span></div>
          {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
          : events.length === 0 ? <div className="p-6 text-center text-xs text-muted-foreground">No events yet. Trigger a sync to pull data.</div>
          : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground"><th className="py-2 pr-3">When</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Ref</th><th className="py-2 pr-3">Status</th></tr></thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-t border-border/40">
                      <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</td>
                      <td className="py-2 pr-3 text-xs">{e.event_type}</td>
                      <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">{e.external_id ?? "—"}</td>
                      <td className="py-2 pr-3"><StatusPill status={String(e.status).toUpperCase()} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2 text-sm">{lastRun?.status === "error" ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-success" />}<span className="font-semibold">Sync history</span></div>
          {runs.length === 0 ? <div className="p-6 text-center text-xs text-muted-foreground">No sync runs yet.</div>
          : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground"><th className="py-2 pr-3">Started</th><th className="py-2 pr-3 text-right">Pulled</th><th className="py-2 pr-3 text-right">Reconciled</th><th className="py-2 pr-3 text-right">Errors</th><th className="py-2 pr-3">Status</th></tr></thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-t border-border/40">
                      <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">{new Date(r.started_at).toLocaleString()}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{r.pulled}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-success">{r.reconciled}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-destructive">{r.errors}</td>
                      <td className="py-2 pr-3"><StatusPill status={String(r.status).toUpperCase()} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
