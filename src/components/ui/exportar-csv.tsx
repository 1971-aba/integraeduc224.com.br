"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type ExportarCsvProps = {
  rows: Record<string, string>[];
  filename?: string;
  label?: string;
};

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: Record<string, string>[]) {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header] ?? "")).join(","),
    ),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function ExportarCsv({
  rows,
  filename = "exportacao.csv",
  label,
}: ExportarCsvProps) {
  function handleExport() {
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="w-full sm:w-auto"
    >
      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
      {label ?? `Exportar CSV (${rows.length})`}
    </Button>
  );
}
