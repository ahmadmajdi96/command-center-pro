import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-pill";
import { CrudTable } from "@/components/crud-table";

export const Route = createFileRoute("/_authenticated/quality")({
  head: () => ({ meta: [{ title: "Quality Holds · CORTA WMS" }] }),
  component: () => (
    <div>
      <PageHeader title="Quality Holds" subtitle="Stock quarantines, NCRs, and QC releases" />
      <CrudTable
        title="Quality holds"
        table="quality_holds"
        exportName="quality_holds"
        searchKeys={["reference", "reason", "lot", "status"]}
        statusField="status"
        fields={[
          { key: "reference", label: "Reference", required: true },
          { key: "product_id", label: "Product", refTable: "products", refLabel: "sku" },
          { key: "lot", label: "Lot" },
          { key: "quantity", label: "Qty", type: "number", required: true },
          { key: "reason", label: "Reason", type: "textarea", colSpan: 2, required: true },
          { key: "severity", label: "Severity", type: "select", options: ["low", "medium", "high", "critical"], default: "medium" },
          { key: "status", label: "Status", type: "select", options: ["on_hold", "in_progress", "completed", "cancelled"], default: "on_hold" },
          { key: "qc_source", label: "QC source" },
          { key: "external_ref", label: "External ref", hideInTable: true },
          { key: "created_at", label: "Created", hideInForm: true },
        ]}
      />
    </div>
  ),
});
