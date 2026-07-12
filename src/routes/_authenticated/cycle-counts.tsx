import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Stat } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";
import { TrendCard, CategoryPie, BarCard } from "@/components/mini-analytics";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cycle-counts")({
  head: () => ({ meta: [{ title: "Cycle Counts · CORTA WMS" }] }),
  component: CycleCountsPage,
});

function CycleCountsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    supabase.from("cycle_counts").select("*").order("created_at", { ascending: false }).limit(1000)
      .then(({ data }) => setRows((data ?? []) as Record<string, unknown>[]));
  }, []);
  const total = rows.length;
  const completed = rows.filter((r) => String(r.status) === "completed").length;
  const openC = rows.filter((r) => String(r.status) === "open").length;
  const avgVar = rows.length
    ? (rows.reduce((s, r) => s + Math.abs(Number(r.variance ?? 0)), 0) / rows.length).toFixed(2)
    : "0";

  const varianceBuckets = [
    { name: "0", value: 0 },
    { name: "±1-2", value: 0 },
    { name: "±3-5", value: 0 },
    { name: "±6-10", value: 0 },
    { name: ">10", value: 0 },
  ];
  rows.forEach((r) => {
    const v = Math.abs(Number(r.variance ?? 0));
    if (v === 0) varianceBuckets[0].value++;
    else if (v <= 2) varianceBuckets[1].value++;
    else if (v <= 5) varianceBuckets[2].value++;
    else if (v <= 10) varianceBuckets[3].value++;
    else varianceBuckets[4].value++;
  });

  return (
    <div>
      <PageHeader title="Cycle Counts" subtitle="Scheduled and blind counts with variance tracking" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total counts" value={total} tone="primary" />
        <Stat label="Completed" value={completed} tone="success" />
        <Stat label="Open" value={openC} tone="warning" />
        <Stat label="Avg variance" value={avgVar} tone="info" />
      </div>
      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <TrendCard title="Counts scheduled · 30 days" rows={rows} dateField="created_at" color="oklch(0.72 0.18 155)" />
        <CategoryPie title="By status" rows={rows} field="status" />
        <BarCard title="Variance distribution" data={varianceBuckets} color="oklch(0.78 0.18 75)" />
      </div>
      <CrudTable
        title="Cycle counts"
        table="cycle_counts"
        exportName="cycle_counts"
        searchKeys={["reference", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "warehouse_id", label: "Warehouse", refTable: "warehouses", refLabel: "name" },
          { key: "zone_id", label: "Zone", refTable: "zones", refLabel: "name" },
          { key: "scheduled_for", label: "Scheduled", type: "date" },
          { key: "variance", label: "Variance", type: "number", default: 0 },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed"], default: "open" },
          { key: "completed_at", label: "Completed", type: "date", hideInForm: true },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  );
}
