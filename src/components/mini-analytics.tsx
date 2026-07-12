import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const tooltipStyle = {
  background: "oklch(0.16 0.02 240 / 0.95)",
  border: "1px solid oklch(0.3 0.02 245)",
  borderRadius: 8,
  fontSize: 12,
};

const PIE_COLORS = [
  "oklch(0.78 0.16 195)",
  "oklch(0.78 0.18 75)",
  "oklch(0.72 0.18 155)",
  "oklch(0.66 0.22 25)",
  "oklch(0.7 0.16 265)",
  "oklch(0.7 0.18 320)",
  "oklch(0.6 0.12 200)",
];

export function TrendCard({
  title,
  rows,
  dateField,
  color = "oklch(0.78 0.16 195)",
  valueField,
  days = 30,
}: {
  title: string;
  rows: Record<string, unknown>[];
  dateField: string;
  color?: string;
  valueField?: string; // if provided, sum instead of count
  days?: number;
}) {
  const data = useMemo(() => {
    const start = new Date(Date.now() - days * 864e5);
    const map = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(start.getTime() + i * 864e5).toISOString().slice(0, 10);
      map.set(d, 0);
    }
    for (const r of rows) {
      const raw = (r as Record<string, unknown>)[dateField];
      if (!raw) continue;
      const d = String(raw).slice(0, 10);
      if (!map.has(d)) continue;
      const inc = valueField ? Number((r as Record<string, unknown>)[valueField] ?? 0) : 1;
      map.set(d, (map.get(d) ?? 0) + inc);
    }
    return Array.from(map.entries()).map(([day, count]) => ({ day: day.slice(5), count }));
  }, [rows, dateField, valueField, days]);

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 h-40">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`gr-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
            <XAxis dataKey="day" stroke="oklch(0.68 0.02 245)" fontSize={9} />
            <YAxis stroke="oklch(0.68 0.02 245)" fontSize={9} width={30} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="count" stroke={color} fill={`url(#gr-${title})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryPie({
  title,
  rows,
  field,
}: {
  title: string;
  rows: Record<string, unknown>[];
  field: string;
}) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = String((r as Record<string, unknown>)[field] ?? "n/a");
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));
  }, [rows, field]);
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 h-40">
        {data.length === 0 ? (
          <div className="pt-14 text-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={32} outerRadius={60} paddingAngle={2}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        {data.slice(0, 6).map((d, i) => (
          <span key={i} className="flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 rounded" style={{ background: d.color }} />
            {d.name} · {d.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarCard({
  title,
  data,
  color = "oklch(0.78 0.18 75)",
}: {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 h-40">
        {data.length === 0 ? (
          <div className="pt-14 text-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 245 / 0.4)" />
              <XAxis dataKey="name" stroke="oklch(0.68 0.02 245)" fontSize={9} />
              <YAxis stroke="oklch(0.68 0.02 245)" fontSize={9} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
