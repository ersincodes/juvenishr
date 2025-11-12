"use client";

import { useMemo, useState } from "react";
import { RowData } from "@/types/data";
import { useTranslation } from "react-i18next";

type Props = {
  rows: RowData[];
  visibleColumns: Set<string>;
  className?: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

const DataTable = ({
  rows,
  visibleColumns,
  className,
  initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
}: Props) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(1); // 1-indexed for UX
  const COLUMN_LABEL_KEYS: Record<string, string> = {
    Name: "col.name",
    Phone: "col.phone",
    City: "col.city",
    Source: "col.source",
    "Phone Status": "col.phoneStatus",
    "F2F Status": "col.f2fStatus",
    "Docs Status": "col.docsStatus",
    "Job Status": "col.jobStatus",
    Level: "col.level",
    "Submitted At": "col.submittedAt",
    Dealer: "col.dealer",
  };

  const allColumns = Object.keys(rows[0] ?? {});
  const columns = allColumns.filter((c) => visibleColumns.has(c));

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  // Derive a clamped page value for safe rendering without mutating state
  const clampedPage = Math.min(totalPages, Math.max(1, page));

  const [startIndex, endIndex, pagedRows] = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalRows);
    return [start, end, rows.slice(start, end)] as const;
  }, [clampedPage, pageSize, rows, totalRows]);

  const handlePrevPage = () => {
    setPage((p) => (p > 1 ? p - 1 : p));
  };
  const handleNextPage = () => {
    setPage((p) => (p < totalPages ? p + 1 : p));
  };
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return (
    <div className={className}>
      {totalRows === 0 ? (
        <div
          className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600"
          role="status">
          {t("table.noData")}
        </div>
      ) : (
        <>
          <div className="overflow-auto rounded-lg border border-zinc-200">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-left font-semibold text-zinc-700"
                    aria-label={t("table.rowNumber")}>
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="whitespace-nowrap px-3 py-2 text-left font-semibold text-zinc-700">
                      {COLUMN_LABEL_KEYS[col] ? t(COLUMN_LABEL_KEYS[col]) : col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                    role="row">
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-500">
                      {startIndex + i + 1}
                    </td>
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
          <div className="mt-3 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <label htmlFor="rows-per-page" className="text-sm text-zinc-700">
                {t("table.rowsPerPage")}
              </label>
              <select
                id="rows-per-page"
                aria-label={t("table.rowsPerPage")}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-600">
                {t("table.showing")}{" "}
                <span className="font-medium text-zinc-900">
                  {totalRows ? startIndex + 1 : 0}
                </span>
                –<span className="font-medium text-zinc-900">{endIndex}</span>{" "}
                {t("table.of")}{" "}
                <span className="font-medium text-zinc-900">{totalRows}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={clampedPage <= 1}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous page">
                  {t("table.prev")}
                </button>
                <span className="min-w-[80px] text-center text-sm text-zinc-700">
                  {t("table.page")}{" "}
                  <span className="font-medium text-zinc-900">
                    {clampedPage}
                  </span>{" "}
                  /{" "}
                  <span className="font-medium text-zinc-900">
                    {totalPages}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={clampedPage >= totalPages}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next page">
                  {t("table.next")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
