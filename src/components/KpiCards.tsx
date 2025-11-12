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

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      value
    );
  const formatPercent = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "percent",
      maximumFractionDigits: 1,
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

      {/* Future cards 2-4 will be added here */}
    </section>
  );
};

export default KpiCards;
