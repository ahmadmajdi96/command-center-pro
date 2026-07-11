import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/wms/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { adminClient, verifySecret, json } = await import("@/lib/integrations.server");
        const check = verifySecret(request);
        if (!check.ok) return check.response;
        const url = new URL(request.url);
        const type = url.searchParams.get("type") ?? "sales";
        const since = url.searchParams.get("since");
        const table = type === "purchase" ? "purchase_orders" : "sales_orders";
        const supabase = adminClient();
        let q = supabase.from(table).select("*").order("created_at", { ascending: false }).limit(1000);
        if (since) q = q.gte("created_at", since);
        const { data, error } = await q;
        if (error) return json({ error: error.message }, { status: 500 });
        return json({ data });
      },
    },
  },
});
