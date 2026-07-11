import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/cycle-counts")({
  head: () => ({ meta: [{ title: "Cycle Counts · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Cycle Counts" subtitle="Scheduled and blind counts with variance tracking" />
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
  ),
});
