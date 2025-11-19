import { useMemo } from "react";
import { RowData } from "@/types/data";
import {
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  parseISO,
  isValid,
} from "date-fns";
import { useTranslation } from "react-i18next";

type Props = {
  rows: RowData[];
  className?: string;
};

const InterviewKpiCards = ({ rows, className }: Props) => {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    const today = new Date();

    // Helper to parse "YYYY-MM-DD"
    const parseDate = (dateStr: unknown) => {
      if (typeof dateStr !== "string") return null;
      const d = parseISO(dateStr);
      return isValid(d) ? d : null;
    };

    const todayRows: RowData[] = [];
    let weekCount = 0;
    let monthCount = 0;
    let yearCount = 0;

    rows.forEach((row) => {
      const phoneStatus = row["Phone Status"] as string | undefined;
      if (phoneStatus !== "Görüşme Ayarlandı") return;

      const dateStr = row["Phone Date"]; // "YYYY-MM-DD"
      const date = parseDate(dateStr);
      if (!date) return;

      if (isSameDay(date, today)) {
        todayRows.push(row);
      }
      if (isSameWeek(date, today, { weekStartsOn: 1 })) {
        weekCount++;
      }
      if (isSameMonth(date, today)) {
        monthCount++;
      }
      if (isSameYear(date, today)) {
        yearCount++;
      }
    });

    return { todayRows, weekCount, monthCount, yearCount };
  }, [rows]); // Removed 'today' from dependency as it's created inside

  return (
    <section
      className={
        className ?? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      }>
      {/* Card 1: Today's Interviews (List) */}
      <div
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400"
        tabIndex={0}>
        <h3 className="text-xs text-zinc-600">{t("kpi.todayInterviews")}</h3>
        <div className="mt-2 h-24 overflow-y-auto pr-1">
          {metrics.todayRows.length > 0 ? (
            <ul className="space-y-2">
              {metrics.todayRows.map((row, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-sm">
                  <span className="truncate text-zinc-700">
                    {String(row["Name"] ?? "Unknown")}
                  </span>
                  <span className="ml-2 text-zinc-500 text-xs">
                    {String(row["City"] ?? "No City")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400 italic">
              {t("kpi.noInterviewsToday")}
            </div>
          )}
        </div>
      </div>

      {/* Card 2: This Week */}
      <div
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400 flex flex-col justify-between"
        tabIndex={0}>
        <div>
          <h3 className="text-xs text-zinc-600">{t("kpi.weekInterviews")}</h3>
          <div className="mt-1 text-2xl font-semibold text-zinc-900">
            {metrics.weekCount}
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          {t("kpi.scheduledCount")}
        </div>
      </div>

      {/* Card 3: This Month */}
      <div
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400 flex flex-col justify-between"
        tabIndex={0}>
        <div>
          <h3 className="text-xs text-zinc-600">{t("kpi.monthInterviews")}</h3>
          <div className="mt-1 text-2xl font-semibold text-zinc-900">
            {metrics.monthCount}
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          {t("kpi.scheduledCount")}
        </div>
      </div>

      {/* Card 4: This Year */}
      <div
        className="rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400 flex flex-col justify-between"
        tabIndex={0}>
        <div>
          <h3 className="text-xs text-zinc-600">{t("kpi.yearInterviews")}</h3>
          <div className="mt-1 text-2xl font-semibold text-zinc-900">
            {metrics.yearCount}
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          {t("kpi.scheduledCount")}
        </div>
      </div>
    </section>
  );
};

export default InterviewKpiCards;
