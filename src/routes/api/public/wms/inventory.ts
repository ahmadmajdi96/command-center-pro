import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/wms/inventory")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { adminClient, verifySecret, json } = await import("@/lib/integrations.server");
        const check = verifySecret(request);
        if (!check.ok) return check.response;
        const url = new URL(request.url);
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 500), 5000);
        const supabase = adminClient();
        const { data, error } = await supabase.from("inventory").select("id, product_id, warehouse_id, bin_id, quantity, status, lot, updated_at").limit(limit);
        if (error) return json({ error: error.message }, { status: 500 });
        return json({ data });
      },
    },
  },
});
