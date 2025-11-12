"use client";

import { RowData } from "@/types/data";

type Props = {
  rows: RowData[];
  visibleColumns: Set<string>;
  className?: string;
};

const DataTable = ({ rows, visibleColumns, className }: Props) => {
  if (!rows.length) {
    return (
      <div
        className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600"
        role="status">
        No data for the selected range.
      </div>
    );
  }

  const allColumns = Object.keys(rows[0] ?? {});
  const columns = allColumns.filter((c) => visibleColumns.has(c));

  return (
    <div className={className}>
      <div className="overflow-auto rounded-lg border border-zinc-200">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap px-3 py-2 text-left font-semibold text-zinc-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                role="row">
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-3 py-2">
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatCell = (value: unknown) => {
  if (value == null) return "-";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

export default DataTable;
