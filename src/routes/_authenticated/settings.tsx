import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · CORTA WMS" }] }),
  component: SettingsPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="System-wide preferences · timezone, UOM, currency, integrations"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Save className="h-3.5 w-3.5" /> Save changes
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold">General</h3>
          <div className="space-y-4">
            <Field label="Timezone">
              <select className="h-9 w-full rounded-lg border border-border/60 bg-card/60 px-3 text-sm">
                <option>Asia/Riyadh (GMT+3)</option><option>Asia/Dubai (GMT+4)</option><option>Africa/Cairo (GMT+2)</option>
              </select>
            </Field>
            <Field label="Default UOM">
              <select className="h-9 w-full rounded-lg border border-border/60 bg-card/60 px-3 text-sm">
                <option>EA</option><option>BAG</option><option>BTL</option><option>CAN</option>
              </select>
            </Field>
            <Field label="Currency">
              <select className="h-9 w-full rounded-lg border border-border/60 bg-card/60 px-3 text-sm">
                <option>SAR — Saudi Riyal</option><option>USD — US Dollar</option><option>AED — UAE Dirham</option>
              </select>
            </Field>
            <Field label="Default page size">
              <input type="number" defaultValue={50} className="h-9 w-full rounded-lg border border-border/60 bg-card/60 px-3 text-sm" />
            </Field>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold">Feature flags</h3>
          <div className="space-y-3 text-sm">
            {[
              ["ENABLE_MES_INTEGRATION", true],
              ["ENABLE_QMS_INTEGRATION", true],
              ["ENABLE_OMS_INTEGRATION", true],
              ["ENABLE_CMMS_INTEGRATION", false],
              ["CACHE_DRIVER = redis", true],
              ["Require QA on receipt", true],
              ["Directed putaway", true],
              ["Blind receipt allowed", false],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                <span className="font-mono text-xs">{k}</span>
                <span className={`inline-flex h-5 w-9 items-center rounded-full ${v ? "bg-success/40" : "bg-muted"} p-0.5`}>
                  <span className={`h-4 w-4 rounded-full bg-foreground transition ${v ? "translate-x-4" : ""}`} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Integration endpoints</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["MES_API_BASE_URL", "https://mes.corta.internal/api/v2"],
              ["QMS_API_BASE_URL", "https://qms.corta.internal/api/v1"],
              ["OMS_API_BASE_URL", "https://oms.corta.internal/api/v3"],
              ["CMMS_API_BASE_URL", "https://cmms.corta.internal/api/v1"],
            ].map(([k, v]) => (
              <Field key={k} label={k}>
                <input defaultValue={v} className="h-9 w-full rounded-lg border border-border/60 bg-card/60 px-3 font-mono text-xs" />
              </Field>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
