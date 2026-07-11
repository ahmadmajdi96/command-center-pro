import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Customers" subtitle="Ship-to master and account status" />
      <CrudTable
        title="Customers"
        table="customers"
        exportName="customers"
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
