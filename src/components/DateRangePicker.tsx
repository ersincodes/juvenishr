"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type DateRange = {
  startDate: string;
  endDate: string;
};

type Props = {
  value: DateRange;
  onChange: (v: DateRange) => void;
  maxRangeDays?: number;
};

const formatIsoAsDotted = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
};

const clampIso = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const DateRangePicker = ({ value, onChange, maxRangeDays }: Props) => {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(value);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleOpen = () => {
    setError(null);
    setDraft(value);
    setOpen(true);
  };

  const handleApply = () => {
    if (!draft.startDate || !draft.endDate) {
      setError(t("daterange.error.selectBoth"));
      return;
    }
    if (maxRangeDays) {
      const start = new Date(draft.startDate + "T00:00:00");
      const end = new Date(draft.endDate + "T00:00:00");
      const diffMs = end.getTime() - start.getTime();
      const inclusiveDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (inclusiveDays > maxRangeDays) {
        setError(t("daterange.error.maxDays", { days: maxRangeDays }));
        return;
      }
    }
    onChange(draft);
    setOpen(false);
  };

  const handleClear = () => {
    const today = new Date();
    const end = clampIso(today);
    const start = clampIso(addDays(today, -6));
    setDraft({ startDate: start, endDate: end });
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = addDays(end, -days + 1);
    setDraft({ startDate: clampIso(start), endDate: clampIso(end) });
    setError(null);
  };

  const minEnd = draft.startDate ? draft.startDate : undefined;
  const maxStart = draft.endDate ? draft.endDate : undefined;

  const display =
    value.startDate && value.endDate
      ? `${formatIsoAsDotted(value.startDate)} — ${formatIsoAsDotted(
          value.endDate
        )}`
      : t("daterange.select");

  return (
    <div className="relative" ref={rootRef}>
      <div className="block">
        <button
          id={inputId}
          type="button"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t("daterange.select")}
          tabIndex={0}
          className="mt-1 inline-flex w-[280px] items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900">
          <span className="truncate">{display}</span>
          <svg
            className="h-4 w-4 text-zinc-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true">
            <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM18 9H2v7a2 2 0 002 2h12a2 2 0 002-2V9z" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label={t("daterange.dateRange")}
          className="absolute z-10 mt-2 w-[420px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs text-zinc-600">
                {t("daterange.start")}
              </span>
              <input
                type="date"
                value={draft.startDate}
                max={maxStart}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label={t("daterange.start")}
              />
            </label>
            <label className="block">
              <span className="block text-xs text-zinc-600">
                {t("daterange.end")}
              </span>
              <input
                type="date"
                value={draft.endDate}
                min={minEnd}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label={t("daterange.end")}
              />
            </label>
          </div>

          <div className="border-t p-3">
            <div className="mb-2 text-xs font-medium text-zinc-600">
              {t("daterange.quickPresets")}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                aria-label={t("daterange.last7")}>
                {t("daterange.last7")}
              </button>
              <button
                type="button"
                onClick={() => handlePreset(14)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                aria-label={t("daterange.last14")}>
                {t("daterange.last14")}
              </button>
              <button
                type="button"
                onClick={() => handlePreset(30)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                aria-label={t("daterange.last30")}>
                {t("daterange.last30")}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                aria-label={t("daterange.reset")}>
                {t("daterange.reset")}
              </button>
            </div>
          </div>
          {error ? (
            <div
              role="alert"
              className="border-t px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          ) : null}
          <div className="flex justify-end gap-2 border-t p-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
              aria-label={t("daterange.cancel")}>
              {t("daterange.cancel")}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
              aria-label={t("daterange.apply")}>
              {t("daterange.apply")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DateRangePicker;
