import { supabase } from "@/integrations/supabase/client";

export async function auditLog(entity: string, action: string, entityId?: string, metadata?: Record<string, unknown>) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      actor_id: data.user?.id ?? null,
      actor_email: data.user?.email ?? null,
      entity,
      entity_id: entityId ?? null,
      action,
      metadata: (metadata ?? {}) as any,
    });
  } catch {
    /* audit is best-effort */
  }
}
