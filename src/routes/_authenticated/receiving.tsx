import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/receiving")({
  head: () => ({ meta: [{ title: "Receiving · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Receiving" subtitle="PO and blind receipts · QA inspection · directed putaway" />
      <CrudTable
        title="Receiving orders"
        table="receiving_orders"
        exportName="receiving_orders"
        searchKeys={["reference", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "warehouse_id", label: "Warehouse", refTable: "warehouses", refLabel: "name" },
          { key: "supplier_id", label: "Supplier", refTable: "suppliers", refLabel: "name" },
          { key: "purchase_order_id", label: "PO", refTable: "purchase_orders", refLabel: "reference" },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed", "cancelled"], default: "open" },
          { key: "expected_at", label: "Expected", type: "date" },
          { key: "received_at", label: "Received", type: "date", hideInForm: true },
          { key: "notes", label: "Notes", type: "textarea", hideInTable: true },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
