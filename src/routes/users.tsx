import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { users } from "@/lib/wms-data";
import { PageHeader, Stat, StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Users & Roles · CORTA WMS" }] }),
  component: UsersPage,
});

const roles = [
  { name: "Warehouse Manager", scope: "All warehouses", perms: 42, users: 1 },
  { name: "Supervisor", scope: "Assigned warehouse", perms: 34, users: 1 },
  { name: "Operator", scope: "Assigned zone", perms: 18, users: 2 },
  { name: "Quality Inspector", scope: "QA zones", perms: 22, users: 1 },
  { name: "Maintenance", scope: "Asset scope", perms: 14, users: 1 },
  { name: "Administrator", scope: "System-wide", perms: 88, users: 1 },
];

function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="System users and permission profiles · Admin only"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New user
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Users" value={users.length} />
        <Stat label="Active" value={users.filter(u => u.active).length} tone="success" />
        <Stat label="Roles" value={roles.length} tone="info" />
        <Stat label="Logged in (24h)" value={users.length - 1} tone="accent" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <div key={r.name} className="glass-panel rounded-2xl p-4">
            <div className="text-sm font-semibold">{r.name}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">{r.scope}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <div className="font-mono text-lg">{r.perms}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Permissions</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <div className="font-mono text-lg">{r.users}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Users</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Warehouse</th>
              <th className="py-2 pr-3">Last login</th>
              <th className="py-2 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border/40">
                <td className="py-2.5 pr-3 font-mono text-xs text-primary">{u.id}</td>
                <td className="py-2.5 pr-3 text-xs">{u.name}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{u.email}</td>
                <td className="py-2.5 pr-3 text-xs">{u.role}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px]">{u.warehouse}</td>
                <td className="py-2.5 pr-3 text-[11px] text-muted-foreground">{u.lastLogin}</td>
                <td className="py-2.5 pr-3 text-right"><StatusPill status={u.active ? "active" : "inactive"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
