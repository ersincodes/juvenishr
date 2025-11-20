import { useMemo, useState } from "react";
import { RowData } from "@/types/data";
import {
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  parseISO,
  isValid,
  startOfWeek,
  addDays,
  format,
  Locale,
} from "date-fns";
import { tr, de } from "date-fns/locale";
import { useTranslation } from "react-i18next";

type Props = {
  rows: RowData[];
  className?: string;
};

type WeekDayRowProps = {
  day: Date;
  dayRows: RowData[];
  isToday: boolean;
  locale: Locale;
};

const WeekDayRow = ({ day, dayRows, isToday, locale }: WeekDayRowProps) => {
  const [isOpen, setIsOpen] = useState(isToday || dayRows.length > 0);
  const hasInterviews = dayRows.length > 0;

  return (
    <div className="text-sm border-b border-zinc-100 py-2 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between text-left font-medium transition-colors hover:bg-zinc-50 rounded px-1 -ml-1 ${
          isToday
            ? "text-blue-600 font-bold"
            : hasInterviews
            ? "text-zinc-900 font-bold"
            : "text-zinc-500 font-normal"
        }`}>
        <div className="flex items-center gap-2">
          <span>{format(day, "EEEE, dd MMM", { locale })}</span>
          {hasInterviews && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isToday
                  ? "bg-green-100 text-green-700"
                  : "bg-green-100 text-green-700"
              }`}>
              {dayRows.length}
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${
            isToday
              ? "text-blue-600"
              : hasInterviews
              ? "text-zinc-900"
              : "text-zinc-400"
          }`}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-2">
          {dayRows.length > 0 ? (
            <ul className="space-y-2 border-l-2 border-zinc-200 pl-3 ml-1">
              {dayRows.map((row, idx) => (
                <li key={idx} className="text-xs group">
                  <div className="font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">
                    {String(row["Name"] ?? "-")}
                  </div>
                  <div className="text-zinc-500">
                    {String(row["City"] ?? "-")}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pl-4 text-xs italic text-zinc-400 ml-1 py-1">-</div>
          )}
        </div>
      )}
    </div>
  );
};

const InterviewKpiCards = ({ rows, className }: Props) => {
  const { t, i18n } = useTranslation();

  const metrics = useMemo(() => {
    const today = new Date();

    // Helper to parse "YYYY-MM-DD"
    const parseDate = (dateStr: unknown) => {
      if (typeof dateStr !== "string") return null;
      const d = parseISO(dateStr);
      return isValid(d) ? d : null;
    };

    const todayRows: RowData[] = [];
    const weekRowsByDate: Record<string, RowData[]> = {};
    let weekCount = 0;
    let monthCount = 0;
    let yearCount = 0;
    let totalMonthCount = 0;
    let totalYearCount = 0;

    rows.forEach((row) => {
      // Calculate Total Applications (based on Submitted At)
      const submittedAt = row["Submitted At"] as string | undefined;
      if (submittedAt) {
        const dateStr = submittedAt.replace(" ", "T");
        const date = parseDate(dateStr);
        if (date) {
          if (isSameMonth(date, today)) {
            totalMonthCount++;
          }
          if (isSameYear(date, today)) {
            totalYearCount++;
          }
        }
      }

      // Calculate Scheduled Interviews
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
        const dateKey = format(date, "yyyy-MM-dd");
        if (!weekRowsByDate[dateKey]) {
          weekRowsByDate[dateKey] = [];
        }
        weekRowsByDate[dateKey].push(row);
      }
      if (isSameMonth(date, today)) {
        monthCount++;
      }
      if (isSameYear(date, today)) {
        yearCount++;
      }
    });

    return {
      todayRows,
      weekCount,
      monthCount,
      yearCount,
      weekRowsByDate,
      totalMonthCount,
      totalYearCount,
    };
  }, [rows]);

  const getLocale = () => {
    return i18n.language === "de" ? de : tr;
  };

  return (
    <section
      className={
        className ?? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
                  <span className="ml-2 text-xs text-zinc-500">
                    {String(row["City"] ?? "No City")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full items-center justify-center text-sm italic text-zinc-400">
              {t("kpi.noInterviewsToday")}
            </div>
          )}
        </div>
      </div>

      {/* Card 2: This Week */}
      <div
        className="flex flex-col rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400"
        tabIndex={0}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs text-zinc-600">{t("kpi.weekInterviews")}</h3>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">
            {metrics.weekCount}
          </span>
        </div>
        <div className="h-40 flex-1 overflow-y-auto pr-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(
              startOfWeek(new Date(), { weekStartsOn: 1 }),
              i
            );
            const dateKey = format(day, "yyyy-MM-dd");
            const dayRows = metrics.weekRowsByDate[dateKey] || [];
            const isToday = isSameDay(day, new Date());

            return (
              <WeekDayRow
                key={dateKey}
                day={day}
                dayRows={dayRows}
                isToday={isToday}
                locale={getLocale()}
              />
            );
          })}
        </div>
      </div>

      {/* Container for Card 3 (Month) & Card 4 (Year) */}
      <div className="flex flex-col gap-3 h-full">
        {/* Card 3: This Month */}
        <div
          className="flex flex-1 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400"
          tabIndex={0}>
          <div>
            <h3 className="text-xs text-zinc-600">
              {t("kpi.monthInterviews")}
            </h3>
            <div className="text-xs mt-1 text-zinc-500">
              {t("kpi.scheduledCount")}
            </div>
            <div className="mt-3 text-2xl font-semibold text-zinc-900">
              {metrics.monthCount}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-50 pt-2">
            <span className="text-[10px] text-zinc-500">
              {t("kpi.totalApplications")}: {metrics.totalMonthCount}
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {metrics.totalMonthCount > 0
                ? Math.round(
                    (metrics.monthCount / metrics.totalMonthCount) * 100
                  )
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Card 4: This Year */}
        <div
          className="flex flex-1 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-4 outline-none focus:ring-2 focus:ring-zinc-400"
          tabIndex={0}>
          <div>
            <h3 className="text-xs text-zinc-600">{t("kpi.yearInterviews")}</h3>
            <div className="text-xs mt-1 text-zinc-500">
              {t("kpi.scheduledCount")}
            </div>
            <div className="mt-3 text-2xl font-semibold text-zinc-900">
              {metrics.yearCount}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-50 pt-2">
            <span className="text-[10px] text-zinc-500">
              {t("kpi.totalApplications")}: {metrics.totalYearCount}
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {metrics.totalYearCount > 0
                ? Math.round((metrics.yearCount / metrics.totalYearCount) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewKpiCards;
