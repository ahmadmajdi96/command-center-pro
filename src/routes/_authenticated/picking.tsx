import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/picking")({
  head: () => ({ meta: [{ title: "Picking · CORTA WMS" }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Picking" subtitle="Waves and pick tasks" />
      <CrudTable
        title="Pick waves"
        table="pick_waves"
        exportName="pick_waves"
        searchKeys={["reference", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "warehouse_id", label: "Warehouse", refTable: "warehouses", refLabel: "name" },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed", "cancelled"], default: "open" },
          { key: "notes", label: "Notes", type: "textarea", hideInTable: true },
          { key: "released_at", label: "Released", type: "date", hideInForm: true },
          { key: "completed_at", label: "Completed", type: "date", hideInForm: true },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
      <CrudTable
        title="Pick tasks"
        table="pick_tasks"
        exportName="pick_tasks"
        searchKeys={["status"]}
        statusField="status"
        fields={[
          { key: "wave_id", label: "Wave", refTable: "pick_waves", refLabel: "reference" },
          { key: "sales_order_id", label: "Order", refTable: "sales_orders", refLabel: "reference" },
          { key: "product_id", label: "Product", refTable: "products", refLabel: "sku" },
          { key: "bin_id", label: "Bin", refTable: "bins", refLabel: "code" },
          { key: "quantity", label: "Qty", type: "number", required: true },
          { key: "quantity_picked", label: "Picked", type: "number", default: 0 },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed"], default: "open" },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
