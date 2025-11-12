"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RowData } from "@/types/data";
import { useTranslation } from "react-i18next";

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

type Props = {
  rows: RowData[];
  activeFilters: Record<string, Set<string>>;
  onToggle: (key: string, value: string) => void;
  keys?: string[];
};

const ChipFilter = ({ rows, activeFilters, onToggle, keys }: Props) => {
  const { t } = useTranslation();
  const getColLabel = (col: string) =>
    COLUMN_LABEL_KEYS[col] ? t(COLUMN_LABEL_KEYS[col]) : col;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => {
    const first = rows[0];
    if (!first) return [] as string[];
    if (Array.isArray(keys) && keys.length) {
      return keys.filter(
        (k) => typeof first[k] === "string" || first[k] == null
      );
    }
    return Object.keys(first).filter((k) => typeof first[k] === "string");
  }, [rows, keys]);

  const valuesMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const key of candidates) {
      map.set(key, new Map());
    }
    for (const row of rows) {
      for (const key of candidates) {
        const v = String(row[key] ?? "N/A");
        const inner = map.get(key)!;
        inner.set(v, (inner.get(v) ?? 0) + 1);
      }
    }
    return map;
  }, [rows, candidates]);

  const filteredCandidates = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) => {
      const labelKey = COLUMN_LABEL_KEYS[c];
      const localized = labelKey ? t(labelKey) : c;
      const label = localized.toLowerCase();
      return c.toLowerCase().includes(q) || label.includes(q);
    });
  })();

  const effectiveSelectedKey = useMemo(() => {
    if (selectedKey && candidates.includes(selectedKey)) return selectedKey;
    return candidates[0] ?? null;
  }, [selectedKey, candidates]);

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

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("filters.buttonLabel")}
        tabIndex={0}
        disabled={!candidates.length}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
        }}>
        <span>{t("filters.buttonLabel")}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && candidates.length ? (
        <div
          role="dialog"
          aria-label={t("filters.dialogLabel")}
          className="absolute z-10 mt-2 w-[560px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b p-3">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("filters.searchPlaceholder")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label={t("filters.searchPlaceholder")}
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
          </div>
          <div className="grid max-h-80 grid-cols-2">
            <div className="border-r">
              <div className="px-3 py-2 text-sm font-medium text-zinc-600">
                {t("filters.dialogLabel")}
              </div>
              <ul
                role="listbox"
                aria-label={t("filters.listLabel")}
                className="max-h-64 overflow-auto">
                {filteredCandidates.map((key) => {
                  const isSelected = key === effectiveSelectedKey;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => setSelectedKey(key)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isSelected
                            ? "bg-zinc-100 text-zinc-900"
                            : "text-zinc-800 hover:bg-zinc-50"
                        }`}>
                        {getColLabel(key)}
                      </button>
                    </li>
                  );
                })}
                {!filteredCandidates.length ? (
                  <li className="px-4 py-2 text-sm text-zinc-500">
                    {t("filters.noResults")}
                  </li>
                ) : null}
              </ul>
            </div>
            <div className="flex min-h-0 max-h-64 flex-col p-3">
              {effectiveSelectedKey ? (
                <>
                  <div className="mb-2 text-xs font-medium text-zinc-600">
                    {t("filters.valuesFor", {
                      key: getColLabel(effectiveSelectedKey),
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 overflow-auto pr-1">
                    {Array.from(
                      valuesMap.get(effectiveSelectedKey)?.entries() ?? []
                    )
                      .sort((a, b) => b[1] - a[1])
                      .map(([value, count]) => {
                        const selected =
                          activeFilters[effectiveSelectedKey]?.has(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              effectiveSelectedKey &&
                              onToggle(effectiveSelectedKey, value)
                            }
                            className={`rounded-full border px-3 py-1 text-xs ${
                              selected
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                            }`}
                            aria-pressed={Boolean(selected)}
                            aria-label={`${effectiveSelectedKey} ${value}`}>
                            {value}{" "}
                            <span className="opacity-60">({count})</span>
                          </button>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-zinc-500">
                  {t("filters.selectAField")}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t p-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
              aria-label={t("common.close")}>
              {t("common.close")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChipFilter;
