import { useMemo, useState } from "react";

export type ZoneDef = {
  id: string; code: string; name: string; kind: string;
  color: string | null; x: number; y: number; w: number; h: number;
};
export type AisleDef = {
  id: string; zone_id: string; code: string; x: number; y: number;
  length_m: number; orientation: "x" | "y";
};
export type RackDef = {
  id: string; aisle_id: string; code: string; x: number; y: number;
  w: number; d: number; levels: number;
};
export type BinDef = {
  id: string; rack_id: string; code: string; level: number; position: number;
  status: "empty" | "occupied" | "blocked" | "quality_hold";
};

export interface WarehouseIsoProps {
  widthM: number;
  lengthM: number;
  zones: ZoneDef[];
  aisles: AisleDef[];
  racks: RackDef[];
  bins?: BinDef[];
  onSelectRack?: (id: string) => void;
}

// Isometric projection helpers
function iso(x: number, y: number, z = 0, scale = 6) {
  // 2:1 isometric (dimetric): x -> (x-y)*cos(30), y -> (x+y)*sin(30) - z
  const ix = (x - y) * 0.866 * scale;
  const iy = (x + y) * 0.5 * scale - z * scale;
  return { x: ix, y: iy };
}

const STATUS_COLORS: Record<BinDef["status"], string> = {
  empty: "oklch(0.35 0.02 245)",
  occupied: "oklch(0.72 0.18 155)",
  blocked: "oklch(0.55 0.22 25)",
  quality_hold: "oklch(0.78 0.18 75)",
};

export function WarehouseIso({ widthM, lengthM, zones, aisles, racks, bins = [], onSelectRack }: WarehouseIsoProps) {
  const scale = 5;
  const pad = 40;

  const corners = useMemo(() => {
    const c = [iso(0, 0, 0, scale), iso(widthM, 0, 0, scale), iso(widthM, lengthM, 0, scale), iso(0, lengthM, 0, scale)];
    const xs = c.map((p) => p.x), ys = c.map((p) => p.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys), pts: c };
  }, [widthM, lengthM]);

  const vbW = corners.maxX - corners.minX + pad * 2;
  const vbH = corners.maxY - corners.minY + pad * 2 + 60;
  const off = { x: -corners.minX + pad, y: -corners.minY + pad };

  const [hover, setHover] = useState<string | null>(null);

  const binsByRack = useMemo(() => {
    const m = new Map<string, BinDef[]>();
    bins.forEach((b) => {
      if (!m.has(b.rack_id)) m.set(b.rack_id, []);
      m.get(b.rack_id)!.push(b);
    });
    return m;
  }, [bins]);

  return (
    <div className="glass-panel rounded-2xl p-4 overflow-hidden">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxHeight: 620 }}>
        <defs>
          <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.18 0.02 245)" />
            <stop offset="100%" stopColor="oklch(0.14 0.02 245)" />
          </linearGradient>
          <pattern id="grid" width={scale * 5} height={scale * 5} patternUnits="userSpaceOnUse">
            <path d={`M ${scale * 5} 0 L 0 0 0 ${scale * 5}`} fill="none" stroke="oklch(0.28 0.02 245)" strokeWidth="0.4" />
          </pattern>
        </defs>

        {/* Floor plate */}
        <polygon
          points={corners.pts.map((p) => `${p.x + off.x},${p.y + off.y}`).join(" ")}
          fill="url(#floor)" stroke="oklch(0.4 0.02 245)" strokeWidth="1"
        />
        {/* Grid overlay via clipped rect */}
        <polygon
          points={corners.pts.map((p) => `${p.x + off.x},${p.y + off.y}`).join(" ")}
          fill="url(#grid)" opacity="0.35"
        />

        {/* Zones (translucent floor patches) */}
        {zones.map((z) => {
          const p1 = iso(z.x, z.y, 0, scale);
          const p2 = iso(z.x + z.w, z.y, 0, scale);
          const p3 = iso(z.x + z.w, z.y + z.h, 0, scale);
          const p4 = iso(z.x, z.y + z.h, 0, scale);
          const cx = (p1.x + p3.x) / 2 + off.x;
          const cy = (p1.y + p3.y) / 2 + off.y;
          return (
            <g key={z.id}>
              <polygon
                points={[p1, p2, p3, p4].map((p) => `${p.x + off.x},${p.y + off.y}`).join(" ")}
                fill={z.color || "#22d3ee"} fillOpacity="0.12"
                stroke={z.color || "#22d3ee"} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="4 3"
              />
              <text x={cx} y={cy} fontSize="10" fill="oklch(0.85 0.02 245)" textAnchor="middle"
                    style={{ pointerEvents: "none", textTransform: "uppercase", letterSpacing: 1.2 }}>
                {z.code} · {z.name}
              </text>
            </g>
          );
        })}

        {/* Aisles (line paths on floor) */}
        {aisles.map((a) => {
          const start = iso(a.x, a.y, 0, scale);
          const end = a.orientation === "x"
            ? iso(a.x + a.length_m, a.y, 0, scale)
            : iso(a.x, a.y + a.length_m, 0, scale);
          return (
            <line key={a.id}
              x1={start.x + off.x} y1={start.y + off.y}
              x2={end.x + off.x} y2={end.y + off.y}
              stroke="oklch(0.45 0.02 245)" strokeWidth="1" strokeDasharray="2 2" />
          );
        })}

        {/* Racks (extruded 3D boxes) */}
        {racks.sort((a, b) => (a.y + a.x) - (b.y + b.x)).map((r) => {
          const height = r.levels * 1.5;
          // 8 corners
          const b1 = iso(r.x, r.y, 0, scale);
          const b2 = iso(r.x + r.w, r.y, 0, scale);
          const b3 = iso(r.x + r.w, r.y + r.d, 0, scale);
          const b4 = iso(r.x, r.y + r.d, 0, scale);
          const t1 = iso(r.x, r.y, height, scale);
          const t2 = iso(r.x + r.w, r.y, height, scale);
          const t3 = iso(r.x + r.w, r.y + r.d, height, scale);
          const t4 = iso(r.x, r.y + r.d, height, scale);
          const rackBins = binsByRack.get(r.id) || [];
          const occupancy = rackBins.length
            ? rackBins.filter((b) => b.status === "occupied").length / rackBins.length
            : 0;
          const fillTop = occupancy > 0.75 ? "oklch(0.72 0.18 155)"
                        : occupancy > 0.4 ? "oklch(0.78 0.18 75)"
                        : "oklch(0.55 0.06 245)";
          const isHover = hover === r.id;
          const stroke = isHover ? "oklch(0.9 0.16 195)" : "oklch(0.5 0.04 245)";
          const sw = isHover ? 1.4 : 0.7;

          const P = (p: { x: number; y: number }) => `${p.x + off.x},${p.y + off.y}`;
          return (
            <g key={r.id}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelectRack?.(r.id)}
              style={{ cursor: onSelectRack ? "pointer" : "default" }}
            >
              {/* right face */}
              <polygon points={`${P(b2)} ${P(b3)} ${P(t3)} ${P(t2)}`} fill="oklch(0.24 0.02 245)" stroke={stroke} strokeWidth={sw} />
              {/* front face */}
              <polygon points={`${P(b3)} ${P(b4)} ${P(t4)} ${P(t3)}`} fill="oklch(0.30 0.02 245)" stroke={stroke} strokeWidth={sw} />
              {/* top */}
              <polygon points={`${P(t1)} ${P(t2)} ${P(t3)} ${P(t4)}`} fill={fillTop} fillOpacity="0.55" stroke={stroke} strokeWidth={sw} />
              {/* level dividers on front face */}
              {Array.from({ length: r.levels - 1 }).map((_, i) => {
                const lvl = (i + 1) * 1.5;
                const s = iso(r.x, r.y + r.d, lvl, scale);
                const e = iso(r.x + r.w, r.y + r.d, lvl, scale);
                return <line key={i} x1={s.x + off.x} y1={s.y + off.y} x2={e.x + off.x} y2={e.y + off.y} stroke="oklch(0.42 0.02 245)" strokeWidth="0.4" />;
              })}
              {/* code label */}
              <text x={((t1.x + t3.x) / 2) + off.x} y={((t1.y + t3.y) / 2) + off.y - 2}
                    fontSize="7" fill="oklch(0.9 0.02 245)" textAnchor="middle"
                    style={{ pointerEvents: "none", fontFamily: "JetBrains Mono, monospace" }}>
                {r.code}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${pad}, ${vbH - 40})`}>
          {[
            { c: "oklch(0.55 0.06 245)", l: "Low occupancy" },
            { c: "oklch(0.78 0.18 75)", l: "Medium" },
            { c: "oklch(0.72 0.18 155)", l: "High" },
            { c: STATUS_COLORS.quality_hold, l: "Quality hold" },
            { c: STATUS_COLORS.blocked, l: "Blocked" },
          ].map((item, i) => (
            <g key={i} transform={`translate(${i * 110}, 0)`}>
              <rect width="10" height="10" fill={item.c} rx="2" />
              <text x="16" y="9" fontSize="9" fill="oklch(0.75 0.02 245)">{item.l}</text>
            </g>
          ))}
        </g>
      </svg>
      {hover && (() => {
        const r = racks.find((x) => x.id === hover);
        if (!r) return null;
        const rackBins = binsByRack.get(r.id) || [];
        const occ = rackBins.filter((b) => b.status === "occupied").length;
        return (
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="rounded bg-primary/10 text-primary px-2 py-0.5 font-mono">{r.code}</span>
            <span className="text-muted-foreground">{r.levels} levels · {r.w}×{r.d}m</span>
            <span className="text-muted-foreground">{occ}/{rackBins.length} bins occupied</span>
          </div>
        );
      })()}
    </div>
  );
}
