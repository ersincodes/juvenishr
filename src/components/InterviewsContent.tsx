"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "@/components/DataTable";
import InterviewKpiCards from "@/components/InterviewKpiCards";
import ColumnsMultiSelect from "@/components/ColumnsMultiSelect";
import { RowData } from "@/types/data";
import { format, startOfYear, endOfYear } from "date-fns";
import { useTranslation } from "react-i18next";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/Skeleton";

const DEFAULT_VISIBLE_COLUMNS: string[] = [
  "Name",
  "Phone",
  "City",
  "Source",
  "Phone Status",
  "F2F Status",
  "Docs Status",
  "Job Status",
  "Level",
  "Submitted At",
];

type Props = {
  visibleColumns: Set<string>;
  setVisibleColumns: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const InterviewsContent = ({ visibleColumns, setVisibleColumns }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RowData[]>([]);

  const allColumns = useMemo(() => Object.keys(rows[0] ?? {}), [rows]);

  // Initialize visible columns if empty and data loaded
  useEffect(() => {
    if (rows.length > 0) {
      setVisibleColumns((prev) => {
        if (prev.size) return prev;
        const cols = Object.keys(rows[0] ?? {});
        const preferred = DEFAULT_VISIBLE_COLUMNS.filter((k) =>
          cols.includes(k)
        );
        return new Set(preferred.length ? preferred : cols);
      });
    }
  }, [rows, setVisibleColumns]);

  // Fetch data for the current year
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const start = format(startOfYear(now), "yyyy-MM-dd");
        const end = format(endOfYear(now), "yyyy-MM-dd"); // Fetch whole year to be safe

        const params = new URLSearchParams({
          startDate: start,
          endDate: end,
        });

        const res = await fetch(`/api/jobs?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();

        if (!ignore) {
          const data: RowData[] = Array.isArray(json?.data) ? json.data : [];
          setRows(data);
        }
      } catch (e) {
        if (!ignore) setError((e as Error).message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleColumn = (col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const handleShowAll = () => {
    setVisibleColumns(new Set(allColumns));
  };
  const handleHideAll = () => {
    setVisibleColumns(new Set());
  };

  // Filter rows for "Görüşme Ayarlandı"
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const status = String(row["Phone Status"] ?? "");
      return status === "Görüşme Ayarlandı";
    });
  }, [rows]);

  return (
    <div className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="relative" aria-busy={loading ? true : undefined}>
        <div className={loading ? "pointer-events-none opacity-50" : ""}>
          <InterviewKpiCards rows={rows} />

          <section className="mt-6 border-t border-zinc-200 pt-6 flex items-end justify-end">
            <ColumnsMultiSelect
              allColumns={allColumns}
              visibleColumns={visibleColumns}
              onToggle={handleToggleColumn}
              onShowAll={handleShowAll}
              onHideAll={handleHideAll}
              buttonLabel={t("dashboard.columns")}
            />
          </section>

          <DataTable
            rows={filteredRows}
            visibleColumns={visibleColumns}
            className="mt-2"
          />
        </div>

        {loading ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 space-y-6 bg-zinc-50/90 backdrop-blur-sm"
            aria-hidden="true">
            {/* Metrics skeleton - matching Interview KPIs structure */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard
                  key={i}
                  className="bg-white"
                  showAvatar={false}
                  titleRows={1}
                  bodyRows={2}
                />
              ))}
            </div>

            <section className="mt-6 border-t border-zinc-200 pt-6 flex justify-end">
              <Skeleton className="h-10 w-40 rounded-md" />
            </section>

            {/* Table skeleton */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white mt-2">
              <div className="bg-zinc-50 px-3 py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="divide-y divide-zinc-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InterviewsContent;
