import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/carriers")({
  head: () => ({ meta: [{ title: "Carriers · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Carriers" subtitle="Shipping carriers and service levels" />
      <CrudTable
        title="Carriers"
        table="carriers"
        exportName="carriers"
        order="name"
        ascending
        searchKeys={["name", "code", "service_level"]}
        fields={[
          { key: "name", label: "Name", required: true },
          { key: "code", label: "Code" },
          { key: "service_level", label: "Service level" },
          { key: "contact_email", label: "Email" },
          { key: "contact_phone", label: "Phone" },
          { key: "tracking_url_template", label: "Tracking URL", colSpan: 2, hideInTable: true },
          { key: "active", label: "Active", type: "checkbox", default: true },
        ]}
      />
    </div>
  ),
});
