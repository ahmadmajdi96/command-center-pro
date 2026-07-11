import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDashboard } from "@/components/integration-dashboard";
export const Route = createFileRoute("/_authenticated/integrations/qms")({
  head: () => ({ meta: [{ title: "QMS · CORTA WMS" }] }),
  component: () => <IntegrationDashboard system="qms" subtitle="Quality management — inspections, NCRs, holds" />,
});
