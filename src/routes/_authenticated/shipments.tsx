import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/shipments")({
  head: () => ({ meta: [{ title: "Shipments · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Shipments" subtitle="Loading and dispatch" />
      <CrudTable
        title="Shipments"
        table="shipments"
        exportName="shipments"
        searchKeys={["reference", "tracking_number", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "sales_order_id", label: "Order", refTable: "sales_orders", refLabel: "reference" },
          { key: "carrier_id", label: "Carrier", refTable: "carriers", refLabel: "name" },
          { key: "tracking_number", label: "Tracking" },
          { key: "destination", label: "Destination" },
          { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "completed", "cancelled"], default: "open" },
          { key: "shipped_at", label: "Shipped", type: "date", hideInForm: true },
          { key: "delivered_at", label: "Delivered", type: "date", hideInForm: true },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
