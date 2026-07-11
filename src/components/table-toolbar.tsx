import { Search, Download } from "lucide-react";
import { downloadCSV, type Column } from "@/lib/reports-export";

export function TableToolbar({
  q,
  onQ,
  placeholder = "Search…",
  filterValue,
  onFilter,
  filterOptions,
  filterLabel = "All",
  exportName,
  exportColumns,
  exportRows,
  right,
}: {
  q: string;
  onQ: (v: string) => void;
  placeholder?: string;
  filterValue?: string;
  onFilter?: (v: string) => void;
  filterOptions?: string[];
  filterLabel?: string;
  exportName?: string;
  exportColumns?: Column[];
  exportRows?: Record<string, unknown>[];
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative max-w-sm flex-1 min-w-[180px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 rounded-lg border border-border/60 bg-card/60 pl-8 pr-3 text-sm"
        />
      </div>
      {filterOptions && onFilter && (
        <select
          value={filterValue ?? ""}
          onChange={(e) => onFilter(e.target.value)}
          className="h-9 rounded-lg border border-border/60 bg-card/60 px-2 text-xs"
        >
          <option value="">{filterLabel}</option>
          {filterOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
      <div className="ml-auto flex items-center gap-2">
        {exportName && exportColumns && exportRows && (
          <button
            onClick={() => downloadCSV(exportName, exportColumns, exportRows)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        )}
        {right}
      </div>
    </div>
  );
}
