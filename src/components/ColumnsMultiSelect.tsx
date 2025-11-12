"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  allColumns: string[];
  visibleColumns: Set<string>;
  onToggle: (column: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  buttonLabel?: string;
};

const ColumnsMultiSelect = ({
  allColumns,
  visibleColumns,
  onToggle,
  onShowAll,
  onHideAll,
  buttonLabel = "Columns",
}: Props) => {
  const { t } = useTranslation();
  const COLUMN_LABEL_KEYS: Record<string, string> = {
    Name: "col.name",
    Phone: "col.phone",
    City: "col.city",
    Source: "col.source",
    "Phone Status": "col.phoneStatus",
    "Phone Date": "col.phoneDate",
    "F2F Status": "col.f2fStatus",
    "F2F Date": "col.f2fDate",
    "Docs Status": "col.docsStatus",
    "Job Status": "col.jobStatus",
    "Job Date": "col.jobDate",
    "Job Exit": "col.jobExit",
    "Form URL": "col.formUrl",
    Level: "col.level",
    "Submitted At": "col.submittedAt",
    Dealer: "col.dealer",
  };
  const getColLabel = (col: string) =>
    COLUMN_LABEL_KEYS[col] ? t(COLUMN_LABEL_KEYS[col]) : col;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (open) {
      // Small delay to ensure element is present in DOM
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? allColumns
    : allColumns.filter((c) => {
        const labelKey = COLUMN_LABEL_KEYS[c];
        const localized = labelKey ? t(labelKey) : c;
        const label = localized.toLowerCase();
        return c.toLowerCase().includes(q) || label.includes(q);
      });

  const selectedCount = visibleColumns.size;
  const allCount = allColumns.length;

  if (!allColumns.length) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("columns.dialogLabel")}
        tabIndex={0}
        disabled={!allColumns.length}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
        }}>
        <span>{buttonLabel || t("columns.buttonLabel")}</span>
        <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs font-medium text-white">
          {selectedCount}/{allCount}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t("columns.dialogLabel")}
          className="absolute z-10 mt-2 w-[320px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b p-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("columns.search")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label={t("columns.search")}
              />
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 103.473 9.8l3.613 3.614a.75.75 0 101.06-1.06l-3.614-3.614A5.5 5.5 0 009 3.5zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onShowAll();
                  setQuery("");
                }}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                aria-label={t("columns.showAll")}>
                {t("columns.showAll")}
              </button>
              <button
                type="button"
                onClick={() => {
                  onHideAll();
                  setQuery("");
                }}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                aria-label={t("columns.clearAll")}>
                {t("columns.clearAll")}
              </button>
            </div>
          </div>
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="max-h-64 overflow-auto p-2">
            {filtered.map((col) => {
              const checked = visibleColumns.has(col);
              return (
                <li key={col}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-zinc-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(col)}
                      className="h-4 w-4"
                      aria-checked={checked}
                      aria-label={getColLabel(col)}
                    />
                    <span className="truncate">{getColLabel(col)}</span>
                  </label>
                </li>
              );
            })}
            {!filtered.length ? (
              <li className="px-2 py-1 text-sm text-zinc-500">
                {t("columns.noResults")}
              </li>
            ) : null}
          </ul>
          <div className="flex items-center justify-between border-t p-2">
            <div className="px-2 text-xs text-zinc-600">
              {t("columns.selectedCount", {
                selected: selectedCount,
                all: allCount,
              })}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm hover:bg-zinc-100"
                aria-label={t("common.close")}>
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ColumnsMultiSelect;
