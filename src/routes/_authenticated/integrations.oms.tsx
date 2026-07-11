import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDashboard } from "@/components/integration-dashboard";
export const Route = createFileRoute("/_authenticated/integrations/oms")({
  head: () => ({ meta: [{ title: "OMS · CORTA WMS" }] }),
  component: () => <IntegrationDashboard system="oms" subtitle="Order management — sales orders and fulfillment" />,
});
