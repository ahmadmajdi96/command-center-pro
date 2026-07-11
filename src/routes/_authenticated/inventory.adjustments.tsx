import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/inventory/adjustments")({
  head: () => ({ meta: [{ title: "Adjustments · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Inventory Adjustments" subtitle="Manual quantity corrections with reason codes" />
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
  ),
});
