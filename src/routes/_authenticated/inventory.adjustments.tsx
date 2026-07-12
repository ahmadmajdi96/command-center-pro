import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Stat } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";
import { TrendCard, CategoryPie, BarCard } from "@/components/mini-analytics";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/inventory/adjustments")({
  head: () => ({ meta: [{ title: "Adjustments · CORTA WMS" }] }),
  component: AdjustmentsPage,
});

function AdjustmentsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    supabase.from("inventory_adjustments").select("*").order("created_at", { ascending: false }).limit(1000)
      .then(({ data }) => setRows((data ?? []) as Record<string, unknown>[]));
  }, []);
  const total = rows.length;
  const positive = rows.filter((r) => Number(r.quantity_delta) > 0).length;
  const negative = rows.filter((r) => Number(r.quantity_delta) < 0).length;
  const net = rows.reduce((s, r) => s + Number(r.quantity_delta ?? 0), 0);

  const byReason = new Map<string, number>();
  rows.forEach((r) => {
    const k = String(r.reason ?? "n/a").slice(0, 24);
    byReason.set(k, (byReason.get(k) ?? 0) + Math.abs(Number(r.quantity_delta ?? 0)));
  });
  const barData = Array.from(byReason.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Inventory Adjustments" subtitle="Manual quantity corrections with reason codes" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Adjustments" value={total} tone="primary" />
        <Stat label="Positive" value={positive} tone="success" />
        <Stat label="Negative" value={negative} tone="destructive" />
        <Stat label="Net delta" value={net.toLocaleString()} tone={net >= 0 ? "success" : "warning"} />
      </div>
      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <TrendCard title="Adjustments · last 30 days" rows={rows} dateField="created_at" />
        <CategoryPie title="By status" rows={rows} field="status" />
        <BarCard title="Volume by reason" data={barData} />
      </div>
      <CrudTable
        title="Inventory adjustments"
        table="inventory_adjustments"
        exportName="inventory_adjustments"
        searchKeys={["reference", "reason", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "product_id", label: "Product", refTable: "products", refLabel: "sku" },
          { key: "bin_id", label: "Bin", refTable: "bins", refLabel: "code" },
          { key: "quantity_delta", label: "Delta", type: "number", required: true },
          { key: "reason", label: "Reason", required: true, type: "textarea", colSpan: 2 },
          { key: "status", label: "Status", type: "select", options: ["open", "completed", "cancelled"], default: "completed" },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  );
}
