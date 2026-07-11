import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  Package,
  Warehouse,
  Truck,
  ClipboardList,
  ShoppingCart,
  PackageCheck,
  PackageOpen,
  Send,
  Scan,
  ShieldCheck,
  Factory,
  Users,
  Settings,
  History,
  BarChart3,
  Wrench,
  Repeat,
  ScrollText,
  Building2,
  UsersRound,
  Boxes as BoxesIcon,
  Cable,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const overview = [
  { title: "Control Center", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Warehouses", url: "/warehouses", icon: Warehouse },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const inventory = [
  { title: "Stock Overview", url: "/inventory", icon: Boxes, exact: true },
  { title: "Adjustments", url: "/inventory/adjustments", icon: Repeat },
  { title: "Cycle Counts", url: "/cycle-counts", icon: Scan },
  { title: "Products", url: "/products", icon: Package },
];

const inbound = [
  { title: "Suppliers", url: "/suppliers", icon: Building2 },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ClipboardList },
  { title: "Receiving", url: "/receiving", icon: PackageOpen },
  { title: "Putaway", url: "/putaway", icon: PackageCheck },
];

const outbound = [
  { title: "Customers", url: "/customers", icon: UsersRound },
  { title: "Sales Orders", url: "/sales-orders", icon: ShoppingCart },
  { title: "Picking", url: "/picking", icon: BoxesIcon },
  { title: "Packing", url: "/packing", icon: Package },
  { title: "Shipments", url: "/shipments", icon: Send },
  { title: "Carriers", url: "/carriers", icon: Truck },
];

const control = [
  { title: "Quality Holds", url: "/quality", icon: ShieldCheck },
];

const integrations = [
  { title: "MES", url: "/integrations/mes", icon: Factory },
  { title: "QMS", url: "/integrations/qms", icon: ShieldCheck },
  { title: "OMS", url: "/integrations/oms", icon: ShoppingCart },
  { title: "CMMS", url: "/integrations/cmms", icon: Wrench },
];

const platform = [
  { title: "Users & Roles", url: "/users", icon: Users },
  { title: "Audit Log", url: "/audit", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean; roles?: string[] };

import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { roles, isAdmin } = useAuth();
  const isActive = (item: Item) => (item.exact ? path === item.url : path === item.url || path.startsWith(item.url + "/"));
  const visible = (items: Item[]) => items.filter((i) => !i.roles || isAdmin || i.roles.some((r) => roles.includes(r as any)));

  // Role gating: platform routes are admin-only; quality is quality/admin/manager; MES/CMMS are maintenance/manager/admin
  const platformGated: Item[] = platform.map((p) => ({ ...p, roles: ["admin"] }));
  const controlGated: Item[] = control.map((p) => ({ ...p, roles: ["admin", "manager", "quality"] }));
  const integrationsGated: Item[] = integrations.map((p) => ({ ...p, roles: ["admin", "manager", "supervisor", "maintenance", "quality"] }));

  const renderGroup = (label: string, items: Item[]) => {
    const vis = visible(items);
    if (vis.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {vis.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item)}
                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:border data-[active=true]:border-primary/30 rounded-lg h-9"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-[var(--shadow-glow)]">
            <Warehouse className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">CORTA WMS</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Warehouse Ops · v1.0
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {renderGroup("Overview", overview)}
        {renderGroup("Inventory", inventory)}
        {renderGroup("Inbound", inbound)}
        {renderGroup("Outbound", outbound)}
        {renderGroup("Control", controlGated)}
        {renderGroup("Integrations", integrationsGated)}
        {renderGroup("Platform", platformGated)}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="rounded-xl border border-border/60 bg-card/60 p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 text-xs">
            <span className="status-dot animate-pulse-glow text-success" />
            <span className="font-medium">All systems nominal</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">Live · RLS-secured backend</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Cable className="h-3 w-3" />
            <span>MES · QMS · OMS · CMMS</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
