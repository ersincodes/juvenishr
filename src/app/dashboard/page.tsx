"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import DateRangePicker from "@/components/DateRangePicker";
import ChipFilter from "@/components/ChipFilter";
import KpiCards from "@/components/KpiCards";
import DataTable from "@/components/DataTable";
import ColumnsMultiSelect from "@/components/ColumnsMultiSelect";
import { RowData } from "@/types/data";
import { filterRows } from "@/utils/metrics";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/Skeleton";

type DateRange = { startDate: string; endDate: string };

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

const FILTER_KEYS: string[] = [
  "City",
  "Source",
  "Phone Status",
  "F2F Status",
  "Docs Status",
  "Job Status",
  "Level",
  "Dealer",
];

const getDefaultRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
};

const DashboardPage = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RowData[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<
    Record<string, Set<string>>
  >({});

  const allColumns = useMemo(() => Object.keys(rows[0] ?? {}), [rows]);
  const allColumnsKey = useMemo(() => allColumns.join("|"), [allColumns]);

  // Fetch data for date range
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        const res = await fetch(`/api/jobs?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        if (!ignore) {
          const data: RowData[] = Array.isArray(json?.data) ? json.data : [];
          setRows(data);
          // Initialize columns on first load to a curated default set
          const cols = Object.keys(data[0] ?? {});
          setVisibleColumns((prev) => {
            if (prev.size) return prev;
            const preferred = DEFAULT_VISIBLE_COLUMNS.filter((k) =>
              cols.includes(k)
            );
            return new Set(preferred.length ? preferred : cols);
          });
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
  }, [dateRange.startDate, dateRange.endDate]);

  // Load saved visible columns
  useEffect(() => {
    const loadPrefs = async () => {
      if (!session?.user?.id) return;
      if (!allColumnsKey) return;
      const res = await fetch(`/api/users/${session.user.id}/settings`);
      if (!res.ok) return;
      const json = await res.json();
      const saved: string[] = json?.settings?.visibleColumns ?? [];
      const cols = saved.filter((c) => allColumns.includes(c));
      if (cols.length) setVisibleColumns(new Set(cols));
    };
    loadPrefs();
  }, [session?.user?.id, allColumns, allColumnsKey]);

  // Persist visible columns
  useEffect(() => {
    const persist = async () => {
      if (!session?.user?.id) return;
      if (!allColumns.length) return;
      const body = { visibleColumns: Array.from(visibleColumns) };
      await fetch(`/api/users/${session.user.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns, session?.user?.id, allColumnsKey]);

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

  const handleToggleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const copy = { ...prev };
      const set = new Set(copy[key] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      copy[key] = set;
      return copy;
    });
  };

  const filteredRows = useMemo(
    () => filterRows(rows, activeFilters),
    [rows, activeFilters]
  );
  // Derived KPI cards use filteredRows directly

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            aria-label={t("dashboard.title")}
            className="flex items-center">
            <Image
              src="/asset/Juv.jpeg"
              alt={t("logo.alt")}
              width={140}
              height={42}
              className="h-10 w-auto"
              priority
            />
          </a>
          <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600">
            {session?.user?.name ?? ""}
          </span>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            aria-label={t("auth.logout")}>
            {t("auth.logout")}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="relative" aria-busy={loading ? true : undefined}>
          {/* Foreground content stays mounted; we just dim it when loading */}
          <div className={loading ? "pointer-events-none opacity-50" : ""}>
            <KpiCards rows={filteredRows} />

            <section
              aria-label="Filters and columns"
              className="mt-6 border-t border-zinc-200 pt-6 grid grid-cols-1 items-end gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <ChipFilter
                  rows={rows}
                  activeFilters={activeFilters}
                  onToggle={handleToggleFilter}
                  keys={FILTER_KEYS.filter((k) => allColumns.includes(k))}
                />
              </div>
              <div className="flex items-end justify-end gap-3 lg:col-span-4">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
                <ColumnsMultiSelect
                  allColumns={allColumns}
                  visibleColumns={visibleColumns}
                  onToggle={handleToggleColumn}
                  onShowAll={handleShowAll}
                  onHideAll={handleHideAll}
                  buttonLabel={t("dashboard.columns")}
                />
              </div>
            </section>

            <DataTable
              rows={filteredRows}
              visibleColumns={visibleColumns}
              className="mt-2"
            />
          </div>

          {/* Absolute overlay skeleton to prevent layout shift */}
          {loading ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 space-y-6 bg-zinc-50/90 backdrop-blur-sm"
              aria-hidden="true">
              {/* Metrics skeleton */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <SkeletonText rows={1} lineClassName="h-3 w-24" />
                  <div className="mt-2">
                    <Skeleton
                      className="h-6 w-24"
                      aria-label="Loading total metric"
                    />
                  </div>
                </div>
                <SkeletonCard
                  className="bg-white"
                  showAvatar={false}
                  titleRows={1}
                  bodyRows={4}
                  aria-label="Loading metrics breakdown"
                />
                <SkeletonCard
                  className="bg-white"
                  showAvatar={false}
                  titleRows={1}
                  bodyRows={4}
                  aria-label="Loading metrics breakdown"
                />
              </div>

              {/* Filters & controls skeleton */}
              <section
                aria-label="Loading filters and columns"
                className="mt-6 border-t border-zinc-200 pt-6 grid grid-cols-1 items-end gap-4 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <div className="rounded-lg border border-zinc-200 bg-white p-4">
                    <SkeletonText rows={2} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-8 w-20 rounded-full"
                          aria-label="Loading filter chip"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-end gap-3 lg:col-span-4">
                  <Skeleton
                    className="h-10 w-48 rounded-md"
                    aria-label="Loading date range picker"
                  />
                  <Skeleton
                    className="h-10 w-40 rounded-md"
                    aria-label="Loading columns button"
                  />
                </div>
              </section>

              {/* Table skeleton */}
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <div className="bg-zinc-50 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Skeleton
                      className="h-4 w-6"
                      aria-label="Loading header index"
                    />
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-4 w-24"
                        aria-label="Loading header column"
                      />
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-zinc-100">
                  {Array.from({ length: 8 }).map((_, rowIdx) => (
                    <div
                      key={rowIdx}
                      className={
                        rowIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                      }>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Skeleton
                          className="h-4 w-6"
                          aria-label="Loading row index"
                        />
                        {Array.from({ length: 6 }).map((_, colIdx) => (
                          <Skeleton
                            key={colIdx}
                            className="h-4 w-24"
                            aria-label="Loading cell"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
