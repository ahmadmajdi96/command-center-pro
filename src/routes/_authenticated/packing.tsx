import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/packing")({
  head: () => ({ meta: [{ title: "Packing · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Packing" subtitle="Pack stations and cartonization" />
      <CrudTable
        title="Packs"
        table="packs"
        exportName="packs"
        searchKeys={["reference", "station", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "sales_order_id", label: "Order", refTable: "sales_orders", refLabel: "reference" },
          { key: "station", label: "Station" },
          { key: "weight_kg", label: "Weight (kg)", type: "number" },
          { key: "dimensions", label: "Dimensions" },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed"], default: "open" },
          { key: "packed_at", label: "Packed", type: "date", hideInForm: true },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
