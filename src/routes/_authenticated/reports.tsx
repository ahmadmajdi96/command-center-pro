import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line as RLine, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { accuracyTrend, oeeTrend, plantKpis, stockByCategory } from "@/lib/wms-data";
import { PageHeader, Stat } from "@/components/status-pill";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports · CORTA WMS" }] }),
  component: ReportsPage,
});

const tooltipStyle = { background: "oklch(0.16 0.02 240 / 0.95)", border: "1px solid oklch(0.3 0.02 245)", borderRadius: 8, fontSize: 12 };

const labour = [
  { day: "Mon", picks: 1420, receipts: 420 },
  { day: "Tue", picks: 1580, receipts: 520 },
  { day: "Wed", picks: 1720, receipts: 610 },
  { day: "Thu", picks: 1680, receipts: 540 },
  { day: "Fri", picks: 1240, receipts: 380 },
  { day: "Sat", picks: 880, receipts: 220 },
  { day: "Sun", picks: 620, receipts: 90 },
];

function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports & Dashboards"
        subtitle="Inventory value · turnover · accuracy · fill rate · labour productivity"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Schedule report
          </button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Inventory value" value={`$${(plantKpis.inventoryValue / 1e6).toFixed(2)}M`} tone="primary" />
        <Stat label="Turnover" value={`${plantKpis.turnover}x`} tone="info" />
        <Stat label="Accuracy" value={`${plantKpis.accuracy}%`} tone="success" />
        <Stat label="Fill rate" value={`${plantKpis.fillRate}%`} tone="accent" />
        <Stat label="Labor util" value={`${plantKpis.laborUtil}%`} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Inventory Value by Category</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stockByCategory} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {stockByCategory.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Accuracy Trend · 14 days</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.02 245)" fontSize={11} domain={[90, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <RLine type="monotone" dataKey="accuracy" stroke="oklch(0.78 0.16 195)" strokeWidth={2} dot={false} />
                <RLine type="monotone" dataKey="fillRate" stroke="oklch(0.72 0.18 155)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Labour Productivity — This week</h3>
          <p className="text-xs text-muted-foreground">Picks vs receipts (units)</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <BarChart data={labour}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="picks" fill="oklch(0.78 0.16 195)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="receipts" fill="oklch(0.78 0.18 75)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Throughput — Today</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <AreaChart data={oeeTrend}>
                <defs>
                  <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
                <XAxis dataKey="hour" stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.02 245)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="picks" stroke="oklch(0.78 0.16 195)" fill="url(#r1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
