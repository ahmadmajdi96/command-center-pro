import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Suppliers" subtitle="Vendor master data · contacts and status" />
      <CrudTable
        title="Suppliers"
        table="suppliers"
        exportName="suppliers"
        order="name"
        ascending
        searchKeys={["code", "name", "country", "contact_email", "status"]}
        statusField="status"
        fields={[
          { key: "code", label: "Code", required: true },
          { key: "name", label: "Name", required: true },
          { key: "country", label: "Country" },
          { key: "contact_email", label: "Email" },
          { key: "status", label: "Status", type: "select", options: ["active", "inactive", "hold"], default: "active" },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
