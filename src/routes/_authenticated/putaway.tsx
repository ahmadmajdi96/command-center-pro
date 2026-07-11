import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/putaway")({
  head: () => ({ meta: [{ title: "Putaway · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Putaway" subtitle="Directed slotting to bin locations" />
      <CrudTable
        title="Putaway tasks"
        table="putaway_tasks"
        exportName="putaway_tasks"
        searchKeys={["reference", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "receiving_id", label: "Receiving", refTable: "receiving_orders", refLabel: "reference" },
          { key: "product_id", label: "Product", refTable: "products", refLabel: "sku" },
          { key: "quantity", label: "Qty", type: "number", required: true },
          { key: "from_location", label: "From" },
          { key: "to_bin_id", label: "To bin", refTable: "bins", refLabel: "code" },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed"], default: "open" },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
