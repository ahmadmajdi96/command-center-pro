import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/status-pill";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · CORTA WMS" }] }),
  component: SettingsPage,
});

const DEFAULTS = {
  company: { name: "CORTA Industries", timezone: "UTC", currency: "USD" },
  operations: { auto_release_waves: true, require_qa_on_receipt: true, allow_negative_stock: false },
  integrations: {
    mes_enabled: true, qms_enabled: true, oms_enabled: true, cmms_enabled: true,
    qc_system_enabled: true, command_center_enabled: true, sync_interval_minutes: 15,
  },
};

function SettingsPage() {
  const { isAdmin, canManage } = useAuth();
  const [settings, setSettings] = useState<typeof DEFAULTS>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    const { data } = await supabase.from("app_settings").select("*");
    const merged = { ...DEFAULTS };
    for (const row of data ?? []) {
      if (row.key in merged) (merged as any)[row.key] = { ...(merged as any)[row.key], ...(row.value as object) };
    }
    setSettings(merged);
    setLoading(false);
  })(); }, []);

  async function save(key: keyof typeof DEFAULTS) {
    if (!isAdmin) return toast.error("Only admins can save settings");
    setSaving(true);
    const { error } = await supabase.from("app_settings").upsert({ key, value: settings[key] as any });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(`${key} saved`);
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>;

  const Section = ({ k, title, children }: { k: keyof typeof DEFAULTS; title: string; children: React.ReactNode }) => (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {isAdmin && (
          <button onClick={() => save(k)} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
  const Input = ({ k, sk, label, type = "text" }: { k: keyof typeof DEFAULTS; sk: string; label: string; type?: string }) => (
    <label className="text-xs space-y-1">
      <span className="text-muted-foreground">{label}</span>
      <input type={type} disabled={!canManage} value={String((settings[k] as any)[sk] ?? "")} onChange={(e) => setSettings({ ...settings, [k]: { ...(settings[k] as any), [sk]: type === "number" ? Number(e.target.value) : e.target.value } })}
        className="w-full rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm" />
    </label>
  );
  const Toggle = ({ k, sk, label }: { k: keyof typeof DEFAULTS; sk: string; label: string }) => (
    <label className="flex items-center gap-2 text-xs">
      <input type="checkbox" disabled={!canManage} checked={Boolean((settings[k] as any)[sk])} onChange={(e) => setSettings({ ...settings, [k]: { ...(settings[k] as any), [sk]: e.target.checked } })} />
      <span>{label}</span>
    </label>
  );

  return (
    <div>
      <PageHeader title="Settings" subtitle="System-wide configuration" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section k="company" title="Company">
          <Input k="company" sk="name" label="Name" />
          <Input k="company" sk="timezone" label="Timezone" />
          <Input k="company" sk="currency" label="Currency" />
        </Section>
        <Section k="operations" title="Operations">
          <Toggle k="operations" sk="auto_release_waves" label="Auto-release pick waves" />
          <Toggle k="operations" sk="require_qa_on_receipt" label="Require QA on receipt" />
          <Toggle k="operations" sk="allow_negative_stock" label="Allow negative stock" />
        </Section>
        <Section k="integrations" title="Integrations">
          <Toggle k="integrations" sk="mes_enabled" label="MES sync enabled" />
          <Toggle k="integrations" sk="qms_enabled" label="QMS sync enabled" />
          <Toggle k="integrations" sk="oms_enabled" label="OMS sync enabled" />
          <Toggle k="integrations" sk="cmms_enabled" label="CMMS sync enabled" />
          <Toggle k="integrations" sk="qc_system_enabled" label="CORTA QC System sync" />
          <Toggle k="integrations" sk="command_center_enabled" label="Command Center Pro sync" />
          <Input k="integrations" sk="sync_interval_minutes" label="Sync interval (min)" type="number" />
        </Section>
      </div>
    </div>
  );
}
