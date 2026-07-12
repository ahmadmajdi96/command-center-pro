import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  AVAILABLE: "text-success",
  RESERVED: "text-info",
  HOLD: "text-warning",
  QUARANTINED: "text-destructive",
  IN_TRANSIT: "text-accent",
  OPEN: "text-info",
  PARTIAL: "text-warning",
  COMPLETE: "text-success",
  CLOSED: "text-muted-foreground",
  CANCELLED: "text-destructive",
  PLANNED: "text-muted-foreground",
  PICKING: "text-accent",
  PACKED: "text-info",
  SHIPPED: "text-primary",
  DELIVERED: "text-success",
  INSPECTING: "text-warning",
  PUTAWAY: "text-info",
  COMPLETED: "text-success",
  RUNNING: "text-success",
  IN_PROGRESS: "text-accent",
  RELEASED: "text-success",
  REJECTED: "text-destructive",
  OCCUPIED: "text-warning",
  FREE: "text-success",
  LOADING: "text-accent",
  active: "text-success",
  inactive: "text-muted-foreground",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = String(status);
  const c = styles[key] ?? "text-muted-foreground";
  const pulse = ["RUNNING", "AVAILABLE", "LOADING", "PICKING"].includes(key);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        c,
        className,
      )}
    >
      <span className={cn("status-dot", c, pulse && "animate-pulse-glow")} />
      {status}
    </span>
  );
}

export function PageHeader({
 title,
 subtitle,
 actions,
}: {
 title: React.ReactNode;
 subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "info" | "accent" | "destructive";
}) {
  const toneMap: Record<string, string> = {
    primary: "from-primary/20 to-primary/0 text-primary",
    success: "from-success/20 to-success/0 text-success",
    warning: "from-warning/20 to-warning/0 text-warning",
    info: "from-info/20 to-info/0 text-info",
    accent: "from-accent/20 to-accent/0 text-accent",
    destructive: "from-destructive/20 to-destructive/0 text-destructive",
  };
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-4">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-60 ${toneMap[tone]}`} />
      <div className="relative">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        <div className="mt-2 font-mono text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}
