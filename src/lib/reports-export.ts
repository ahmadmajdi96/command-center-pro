import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type Column = { key: string; label: string; format?: (v: unknown, row: Record<string, unknown>) => string };

export function toCSV(columns: Column[], rows: Record<string, unknown>[]) {
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => esc(c.format ? c.format(r[c.key], r) : r[c.key])).join(","))
    .join("\n");
  return header + "\n" + body;
}

export function downloadCSV(filename: string, columns: Column[], rows: Record<string, unknown>[]) {
  const csv = toCSV(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPDF(
  filename: string,
  title: string,
  columns: Column[],
  rows: Record<string, unknown>[],
  meta?: { subtitle?: string; from?: string; to?: string },
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  const parts: string[] = [`Generated: ${new Date().toLocaleString()}`];
  if (meta?.subtitle) parts.push(meta.subtitle);
  if (meta?.from || meta?.to) parts.push(`Range: ${meta.from ?? "…"} → ${meta.to ?? "…"}`);
  doc.text(parts.join(" · "), 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) => columns.map((c) => (c.format ? c.format(r[c.key], r) : String(r[c.key] ?? "")))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 60, 90] },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
