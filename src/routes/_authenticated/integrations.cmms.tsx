import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDashboard } from "@/components/integration-dashboard";
export const Route = createFileRoute("/_authenticated/integrations/cmms")({
  head: () => ({ meta: [{ title: "CMMS · CORTA WMS" }] }),
  component: () => <IntegrationDashboard system="cmms" subtitle="Maintenance — asset downtime, work orders" />,
});
