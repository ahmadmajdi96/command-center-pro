import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { TableToolbar } from "@/components/table-toolbar";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users & Roles · CORTA WMS" }] }),
  component: UsersPage,
});

const ALL_ROLES: AppRole[] = ["admin", "manager", "supervisor", "operator", "quality", "maintenance"];

type ProfileRow = { id: string; email: string | null; full_name: string | null };
type RoleRow = { user_id: string; role: AppRole };

function UsersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  async function load() {
    setLoading(true);
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setProfiles((p.data ?? []) as any);
    setRoles((r.data ?? []) as any);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(userId: string, role: AppRole, on: boolean) {
    if (on) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated"); load();
  }

  if (authLoading) return <div className="p-10 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>;
  if (!isAdmin) return (
    <div className="glass-panel rounded-2xl p-10 text-center">
      <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
      <h2 className="mt-3 text-lg font-semibold">Administrator access required</h2>
      <p className="mt-1 text-sm text-muted-foreground">Only Administrators can manage users and role assignments.</p>
    </div>
  );

  const rolesFor = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);

  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Manage authentication and role-based permissions" />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Users" value={profiles.length} tone="primary" />
        <Stat label="Admins" value={roles.filter(r => r.role === "admin").length} tone="destructive" />
        <Stat label="Managers" value={roles.filter(r => r.role === "manager").length} tone="warning" />
        <Stat label="Operators" value={roles.filter(r => r.role === "operator").length} tone="info" />
      </div>
      <div className="glass-panel rounded-2xl p-4">
        {loading ? <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Current roles</th>
              <th className="py-2 pr-3 text-right">Manage roles</th>
            </tr></thead>
            <tbody>
              {profiles.map((p) => {
                const has = rolesFor(p.id);
                return (
                  <tr key={p.id} className="border-t border-border/40">
                    <td className="py-2.5 pr-3 text-xs">{p.full_name ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{p.email}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {has.length === 0 && <span className="text-[10px] text-muted-foreground">none</span>}
                        {has.map((r) => <StatusPill key={r} status={r.toUpperCase()} />)}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {ALL_ROLES.map((r) => {
                          const on = has.includes(r);
                          return (
                            <button key={r} onClick={() => toggle(p.id, r, !on)}
                              className={`text-[10px] px-2 py-0.5 rounded border transition ${on ? "bg-primary/20 border-primary/40 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
