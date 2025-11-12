import { RowData } from "@/types/data";

export type Metrics = {
  total: number;
  byKey?: { key: string; counts: Record<string, number> };
};

export const filterRows = (
  rows: RowData[],
  activeFilters: Record<string, Set<string>>
): RowData[] => {
  if (!rows.length || Object.keys(activeFilters).length === 0) return rows;
  return rows.filter((row) => {
    for (const [key, allowed] of Object.entries(activeFilters)) {
      if (allowed.size === 0) continue;
      const v = row[key];
      if (!allowed.has(String(v))) return false;
    }
    return true;
  });
};

export const computeMetrics = (
  rows: RowData[],
  activeFilters: Record<string, Set<string>>
): Metrics => {
  const filtered = filterRows(rows, activeFilters);
  const total = filtered.length;
  // Prefer meaningful keys for breakdown
  const firstRow = filtered[0] ?? rows[0];
  let byKey: Metrics["byKey"];
  if (firstRow) {
    const preferredKeys = [
      "Job Status",
      "Phone Status",
      "Source",
      "City",
      "Dealer",
      "Level",
    ];
    const availableKeys = new Set(Object.keys(firstRow));
    let candidateKey =
      preferredKeys.find((k) => availableKeys.has(k)) ??
      Object.keys(firstRow).find((k) => typeof firstRow[k] === "string");
    if (candidateKey && typeof firstRow[candidateKey] !== "string") {
      // Ensure chosen key is string-like in practice
      candidateKey = Object.keys(firstRow).find(
        (k) => typeof firstRow[k] === "string"
      );
    }
    if (candidateKey) {
      const counts: Record<string, number> = {};
      for (const r of filtered) {
        const v = String(r[candidateKey] ?? "N/A");
        counts[v] = (counts[v] ?? 0) + 1;
      }
      byKey = { key: candidateKey, counts };
    }
  }
  return { total, byKey };
};
