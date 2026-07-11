import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Search, Trash2, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { auditLog } from "@/lib/audit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { StatusPill } from "@/components/status-pill";
import { downloadCSV, downloadPDF, type Column } from "@/lib/reports-export";

export type CrudField = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date";
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  default?: unknown;
  hideInTable?: boolean;
  hideInForm?: boolean;
  render?: (v: unknown, row: Record<string, unknown>) => React.ReactNode;
  refTable?: string;
  refLabel?: string;
  refValue?: string;
  colSpan?: 1 | 2;
};

export function CrudTable({
  title,
  table,
  fields,
  order = "created_at",
  ascending = false,
  searchKeys = [],
  exportName,
  extraActions,
  select = "*",
  transform,
  statusField,
  onCreated,
}: {
  title: string;
  table: string;
  fields: CrudField[];
  order?: string;
  ascending?: boolean;
  searchKeys?: string[];
  exportName?: string;
  extraActions?: React.ReactNode;
  select?: string;
  transform?: (row: Record<string, unknown>) => Record<string, unknown>;
  statusField?: string;
  onCreated?: () => void;
}) {
  const { canManage, canOperate } = useAuth();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [refs, setRefs] = useState<Record<string, { id: string; label: string }[]>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any).from(table).select(select).order(order, { ascending });
    if (error) toast.error(error.message);
    const rr = (data as unknown as Record<string, unknown>[]) ?? [];
    setRows(transform ? rr.map(transform) : rr);
    setLoading(false);
  }

  async function loadRefs() {
    const refFields = fields.filter((f) => f.refTable);
    const entries = await Promise.all(
      refFields.map(async (f) => {
        const { data } = await (supabase as any).from(f.refTable!).select(`id, ${f.refLabel ?? "name"}`).limit(500);
        return [
          f.key,
          ((data as unknown as Record<string, unknown>[]) ?? []).map((r) => ({
            id: String(r.id),
            label: String(r[f.refLabel ?? "name"] ?? r.id),
          })),
        ] as const;
      }),
    );
    setRefs(Object.fromEntries(entries));
  }

  useEffect(() => {
    load();
    loadRefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => String((r as Record<string, unknown>)[k] ?? "").toLowerCase().includes(s)),
    );
  }, [q, rows, searchKeys]);

  const visibleFields = fields.filter((f) => !f.hideInTable);
  const columns: Column[] = visibleFields.map((f) => ({
    key: f.key,
    label: f.label,
    format: (v) => (v === null || v === undefined ? "" : String(v)),
  }));

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full h-9 rounded-lg border border-border/60 bg-card/60 pl-8 pr-3 text-sm"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {extraActions}
          {exportName && (
            <>
              <button
                onClick={() => downloadCSV(exportName, columns, filtered)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
              <button
                onClick={() => downloadPDF(exportName, title, columns, filtered)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"
              >
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
            </>
          )}
          {canOperate && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              </DialogTrigger>
              <CrudForm
                fields={fields}
                refs={refs}
                onDone={async (saved) => {
                  setOpen(false);
                  if (saved) {
                    await auditLog(table, "create");
                    onCreated?.();
                    load();
                  }
                }}
                table={table}
              />
            </Dialog>
          )}
        </div>
      </div>
      {loading ? (
        <div className="p-10 text-center">
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">No records.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                {visibleFields.map((f) => (
                  <th key={f.key} className="py-2 pr-3 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                {canManage && <th className="py-2 pr-3"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={String(r.id)} className="border-t border-border/40 align-top">
                  {visibleFields.map((f) => {
                    const v = (r as Record<string, unknown>)[f.key];
                    return (
                      <td key={f.key} className="py-2.5 pr-3 text-xs">
                        {f.render
                          ? f.render(v, r)
                          : statusField === f.key
                            ? <StatusPill status={String(v ?? "").toUpperCase()} />
                            : v === null || v === undefined || v === ""
                              ? <span className="text-muted-foreground">—</span>
                              : String(v)}
                      </td>
                    );
                  })}
                  {canManage && (
                    <td className="py-2.5 pr-3 text-right">
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this record?")) return;
                          const { error } = await (supabase as any).from(table).delete().eq("id", String(r.id));
                          if (error) toast.error(error.message);
                          else {
                            toast.success("Deleted");
                            await auditLog(table, "delete", String(r.id));
                            load();
                          }
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CrudForm({
  fields,
  refs,
  table,
  onDone,
}: {
  fields: CrudField[];
  refs: Record<string, { id: string; label: string }[]>;
  table: string;
  onDone: (saved: boolean) => void;
}) {
  const formFields = fields.filter((f) => !f.hideInForm);
  const [values, setValues] = useState<Record<string, unknown>>(
    Object.fromEntries(formFields.map((f) => [f.key, f.default ?? (f.type === "number" ? 0 : f.type === "checkbox" ? false : "")])),
  );
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const f of formFields) {
      const v = values[f.key];
      if (v === "" || v === null || v === undefined) {
        if (f.required) {
          setSaving(false);
          return toast.error(`${f.label} is required`);
        }
        continue;
      }
      payload[f.key] = v;
    }
    const { error } = await (supabase as any).from(table).insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Created");
    onDone(true);
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create record</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {formFields.map((f) => {
            const v = values[f.key];
            const setV = (nv: unknown) => setValues({ ...values, [f.key]: nv });
            const cls = "w-full rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm";
            const wrap = f.colSpan === 2 || f.type === "textarea" ? "col-span-2" : "";
            return (
              <label key={f.key} className={`text-xs space-y-1 ${wrap}`}>
                <span className="text-muted-foreground">{f.label}{f.required && " *"}</span>
                {f.type === "textarea" ? (
                  <textarea value={String(v ?? "")} onChange={(e) => setV(e.target.value)} className={cls} rows={3} />
                ) : f.type === "select" ? (
                  <select value={String(v ?? "")} onChange={(e) => setV(e.target.value)} className={cls}>
                    <option value="">—</option>
                    {(f.options ?? []).map((o) => {
                      const opt = typeof o === "string" ? { value: o, label: o } : o;
                      return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                    })}
                  </select>
                ) : f.refTable ? (
                  <select value={String(v ?? "")} onChange={(e) => setV(e.target.value)} className={cls}>
                    <option value="">—</option>
                    {(refs[f.key] ?? []).map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                ) : f.type === "number" ? (
                  <input type="number" step="any" value={Number(v ?? 0)} onChange={(e) => setV(Number(e.target.value))} className={cls} />
                ) : f.type === "checkbox" ? (
                  <input type="checkbox" checked={Boolean(v)} onChange={(e) => setV(e.target.checked)} className="h-4 w-4" />
                ) : f.type === "date" ? (
                  <input type="datetime-local" value={String(v ?? "")} onChange={(e) => setV(e.target.value)} className={cls} />
                ) : (
                  <input type="text" value={String(v ?? "")} onChange={(e) => setV(e.target.value)} className={cls} />
                )}
              </label>
            );
          })}
        </div>
        <DialogFooter>
          <button type="button" onClick={() => onDone(false)} className="rounded-lg border border-border/60 px-3 py-1.5 text-xs">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {saving ? "Saving…" : "Create"}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
