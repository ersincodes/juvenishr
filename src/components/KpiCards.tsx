import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RowData } from "@/types/data";

type Props = {
  rows: RowData[];
  className?: string;
};

const KpiCards = ({ rows, className }: Props) => {
  const { t } = useTranslation();

  const {
    totalApplications,
    interviewScheduledCount,
    interviewScheduledPercent,
  } = useMemo(() => {
    const total = rows.length;
    const interviewCount = rows.reduce((acc, row) => {
      const value = String(
        (row as Record<string, unknown>)["Phone Status"] ?? ""
      );
      return acc + (value === "Görüşme Ayarlandı" ? 1 : 0);
    }, 0);
    const pct = total === 0 ? 0 : (interviewCount / total) * 100;
    return {
      totalApplications: total,
      interviewScheduledCount: interviewCount,
      interviewScheduledPercent: pct,
    };
  }, [rows]);

  type TopItem = { name: string; count: number; percent: number };
  const topSources = useMemo<TopItem[]>(() => {
    const total = rows.length;
    if (total === 0) return [];
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const raw = (row as Record<string, unknown>)["Source"];
      const key = String(raw ?? "N/A") || "N/A";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        percent: total === 0 ? 0 : (count / total) * 100,
      }));
    return sorted;
  }, [rows]);

  const topPhoneStatuses = useMemo<TopItem[]>(() => {
    const total = rows.length;
    if (total === 0) return [];
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const raw = (row as Record<string, unknown>)["Phone Status"];
      const key = String(raw ?? "N/A") || "N/A";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        percent: total === 0 ? 0 : (count / total) * 100,
      }));
    return sorted;
  }, [rows]);

  const getFieldValue = (row: RowData, candidateKeys: string[]): string => {
    const record = row as Record<string, unknown>;
    for (const key of candidateKeys) {
      const value = record[key];
      if (value !== undefined && value !== null) {
        const text = String(value).trim();
        if (text) return text;
      }
    }
    return "N/A";
  };

  const topCities = useMemo<TopItem[]>(() => {
    const total = rows.length;
    if (total === 0) return [];
    const counts: Record<string, number> = {};
    const candidates = ["City", "Şehir", "Sehir", "city", "ŞEHİR"];
    for (const row of rows) {
      const key = getFieldValue(row, candidates);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        percent: total === 0 ? 0 : (count / total) * 100,
      }));
    return sorted;
  }, [rows]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      value
    );
  const formatPercent = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);

  return (
    <section
      aria-label={t("kpi.sectionLabel")}
      className={
        className ?? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      }>
      {/* Card 1: Total + Interview Scheduled with percentage */}
      <div
        role="region"
        aria-label={t("kpi.totalAndScheduledCardLabel")}
        tabIndex={0}
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400">
        <div className="flex items-baseline justify-between">
          <div className="text-xs text-zinc-600">
            {t("kpi.totalApplications")}
          </div>
        </div>
        <div className="mt-1 text-2xl font-semibold" aria-live="polite">
          {formatNumber(totalApplications)}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-zinc-700">
            {t("kpi.interviewScheduled")}
            <span className="ml-1 font-medium">
              {formatNumber(interviewScheduledCount)}
            </span>
          </div>
          <div
            className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700"
            aria-label={t("kpi.scheduledOverTotalAria", {
              count: interviewScheduledCount,
              total: totalApplications,
              percent: formatPercent(interviewScheduledPercent),
            })}>
            {formatPercent(interviewScheduledPercent)}
          </div>
        </div>
      </div>

      {/* Card 2: Top Sources (Top 3) with counts and percent over total */}
      <div
        role="region"
        aria-label={t("kpi.topSourcesCardLabel")}
        tabIndex={0}
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400">
        <div className="text-xs text-zinc-600">{t("kpi.topSources")}</div>
        <ul className="mt-2 space-y-2">
          {topSources.map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between text-sm"
              aria-label={t("kpi.sourceItemAria", {
                source: s.name,
                count: s.count,
                percent: s.percent,
              })}>
              <div className="min-w-0 flex-1 truncate text-zinc-700">
                {s.name}
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="font-medium text-zinc-700">
                  {formatNumber(s.count)}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
                  {formatPercent(s.percent)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Card 3: Top Phone Status (Top 3) with counts and percent over total */}
      <div
        role="region"
        aria-label={t("kpi.topPhoneStatusCardLabel")}
        tabIndex={0}
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400">
        <div className="text-xs text-zinc-600">{t("kpi.topPhoneStatuses")}</div>
        <ul className="mt-2 space-y-2">
          {topPhoneStatuses.map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between text-sm"
              aria-label={t("kpi.phoneStatusItemAria", {
                status: s.name,
                count: s.count,
                percent: s.percent,
              })}>
              <div className="min-w-0 flex-1 truncate text-zinc-700">
                {s.name}
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="font-medium text-zinc-700">
                  {formatNumber(s.count)}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
                  {formatPercent(s.percent)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Card 4: Top Cities (Top 3) with counts and percent over total */}
      <div
        role="region"
        aria-label={t("kpi.topCitiesCardLabel")}
        tabIndex={0}
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400">
        <div className="text-xs text-zinc-600">{t("kpi.topCities")}</div>
        <ul className="mt-2 space-y-2">
          {topCities.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between text-sm"
              aria-label={t("kpi.cityItemAria", {
                city: c.name,
                count: c.count,
                percent: c.percent,
              })}>
              <div className="min-w-0 flex-1 truncate text-zinc-700">
                {c.name}
              </div>
              <div className="ml-2 flex items-center gap-2">
                <span className="font-medium text-zinc-700">
                  {formatNumber(c.count)}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
                  {formatPercent(c.percent)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default KpiCards;
