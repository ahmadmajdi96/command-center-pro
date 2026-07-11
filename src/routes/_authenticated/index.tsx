import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line as RLine,
  LineChart, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowUpRight, Boxes, CheckCircle2, Package, PackageOpen,
  Send, ShieldCheck, Truck, Warehouse,
} from "lucide-react";
import {
  accuracyTrend, auditLog, dockDoors, integrations, oeeTrend, plantKpis,
  purchaseOrders, salesOrders, shipments, stockByCategory,
} from "@/lib/wms-data";
import { StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Control Center · CORTA WMS" },
      { name: "description", content: "Real-time plant inventory, receiving, picking, packing and shipping status." },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  background: "oklch(0.16 0.02 240 / 0.95)",
  border: "1px solid oklch(0.3 0.02 245)",
  borderRadius: 8,
  fontSize: 12,
};

function Kpi({
  label, value, delta, icon: Icon, accent = "primary", suffix,
}: {
  label: string; value: string | number; delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "success" | "warning" | "info" | "accent";
  suffix?: string;
}) {
  const accentMap = {
    primary: "from-primary/20 to-primary/0 text-primary",
    success: "from-success/20 to-success/0 text-success",
    warning: "from-warning/20 to-warning/0 text-warning",
    info: "from-info/20 to-info/0 text-info",
    accent: "from-accent/20 to-accent/0 text-accent",
  } as const;
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
          <Icon className={`h-4 w-4 ${accentMap[accent].split(" ").pop()}`} />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-mono text-3xl font-semibold tracking-tight">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        {delta && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 text-success" />
            <span>{delta}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function Dashboard() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Control Center</h1>
          <p className="text-sm text-muted-foreground">
            Riyadh DC · Shift A · <span suppressHydrationWarning>{clock}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">Today</button>
          <button className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">Live</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Inventory Value" value={`$${(plantKpis.inventoryValue / 1e6).toFixed(2)}M`} delta="+2.1% MoM" icon={Boxes} accent="primary" />
        <Kpi label="Accuracy" value={plantKpis.accuracy} suffix="%" delta="+0.4 wow" icon={CheckCircle2} accent="success" />
        <Kpi label="Fill Rate" value={plantKpis.fillRate} suffix="%" icon={Package} accent="info" />
        <Kpi label="Open Receipts" value={plantKpis.openReceipts} icon={PackageOpen} accent="accent" />
        <Kpi label="Open Shipments" value={plantKpis.openShipments} icon={Send} accent="primary" />
        <Kpi label="On Hold" value={plantKpis.onHold} suffix={`+${plantKpis.quarantined} QN`} icon={ShieldCheck} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Throughput — Last 12 hours</h3>
              <p className="text-xs text-muted-foreground">Units received · shipped · picks</p>
            </div>
            <div className="flex gap-3 text-[11px]">
              <Legend dot="bg-primary" label="Received" />
              <Legend dot="bg-accent" label="Shipped" />
              <Legend dot="bg-info" label="Picks" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={oeeTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                <XAxis dataKey="hour" stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="received" stroke="oklch(0.78 0.16 195)" fill="url(#g1)" strokeWidth={2} />
                <RLine type="monotone" dataKey="shipped" stroke="oklch(0.78 0.18 75)" strokeWidth={1.5} dot={false} />
                <RLine type="monotone" dataKey="picks" stroke="oklch(0.72 0.14 230)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Inventory Accuracy</h3>
          <p className="text-xs text-muted-foreground">Composite score · 14 day rolling</p>
          <div className="relative mt-2 h-64">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="60%" outerRadius="95%" data={[{ name: "acc", value: plantKpis.accuracy, fill: "oklch(0.78 0.16 195)" }]} startAngle={210} endAngle={-30}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" background={{ fill: "oklch(0.25 0.02 245)" }} cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl font-semibold text-glow">{plantKpis.accuracy}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Accuracy %</span>
              <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground">
                <span>Fill {plantKpis.fillRate}</span>
                <span>Turn {plantKpis.turnover}</span>
                <span>Labor {plantKpis.laborUtil}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Stock Value by Category</h3>
          <p className="text-xs text-muted-foreground">Total ${(plantKpis.inventoryValue / 1e6).toFixed(2)}M</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stockByCategory} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {stockByCategory.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-[11px]">
            {stockByCategory.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </span>
                <span className="font-mono">${(d.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Accuracy · Fill Rate</h3>
          <p className="text-xs text-muted-foreground">14-day trend</p>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 245)" fontSize={10} />
                <YAxis stroke="oklch(0.68 0.02 245)" fontSize={10} domain={[90, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <RLine type="monotone" dataKey="accuracy" stroke="oklch(0.78 0.16 195)" strokeWidth={2} dot={false} />
                <RLine type="monotone" dataKey="fillRate" stroke="oklch(0.72 0.18 155)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Dock Doors</h3>
              <p className="text-xs text-muted-foreground">7 doors · live</p>
            </div>
            <Truck className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-2">
            {dockDoors.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary">{d.id}</span>
                  <span className="text-[10px] text-muted-foreground">{d.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground">{d.vehicle}</span>
                  <StatusPill status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Open Purchase Orders</h3>
              <p className="text-xs text-muted-foreground">Inbound queue</p>
            </div>
            <Link to="/purchase-orders" className="text-xs text-primary hover:underline">All POs →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">PO</th>
                <th className="py-2 pr-3">Supplier</th>
                <th className="py-2 pr-3">ETA</th>
                <th className="py-2 pr-3">Progress</th>
                <th className="py-2 pr-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-t border-border/40">
                  <td className="py-2.5 pr-3 font-mono text-xs">{p.id}</td>
                  <td className="py-2.5 pr-3 text-xs">{p.supplierName}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{p.eta}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-info" style={{ width: `${p.received}%` }} />
                      </div>
                      <StatusPill status={p.status} />
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-xs">${p.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Outbound Shipments</h3>
              <p className="text-xs text-muted-foreground">Waves in flight</p>
            </div>
            <Link to="/shipments" className="text-xs text-primary hover:underline">All shipments →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Shipment</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Carrier</th>
                <th className="py-2 pr-3">Dock</th>
                <th className="py-2 pr-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-t border-border/40">
                  <td className="py-2.5 pr-3 font-mono text-xs">{s.id}</td>
                  <td className="py-2.5 pr-3 text-xs">{s.customer}</td>
                  <td className="py-2.5 pr-3 text-xs">{s.carrier}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{s.dock}</td>
                  <td className="py-2.5 pr-3 text-right"><StatusPill status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Live audit feed</p>
          <div className="mt-3 space-y-2">
            {auditLog.map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 text-xs">
                <span className="font-mono text-[10px] text-muted-foreground">{a.t}</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">{a.action}</span>
                <span className="font-mono text-[11px]">{a.entity}</span>
                <span className="ml-auto truncate text-muted-foreground">{a.detail}</span>
                <span className="text-[10px] text-muted-foreground">@{a.user}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Integrations</h3>
          <p className="text-xs text-muted-foreground">Live sync status</p>
          <div className="mt-3 space-y-2">
            {Object.entries(integrations).map(([k, v]) => (
              <Link key={k} to={`/integrations/${k.toLowerCase()}` as any} className="block rounded-lg border border-border/60 bg-card/40 p-3 transition hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{k}</span>
                  <span className={`status-dot ${v.connected ? "text-success animate-pulse-glow" : "text-destructive"}`} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{v.connected ? "Connected" : "Degraded"}</span>
                  <span>{v.events24h} events / 24h</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
