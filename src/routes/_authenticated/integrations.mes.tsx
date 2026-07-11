import { createFileRoute } from "@tanstack/react-router";
import { IntegrationDashboard } from "@/components/integration-dashboard";
export const Route = createFileRoute("/_authenticated/integrations/mes")({
  head: () => ({ meta: [{ title: "MES · CORTA WMS" }] }),
  component: () => <IntegrationDashboard system="mes" subtitle="Manufacturing execution — production orders, consumption, output" />,
});
