"use client";

type Props = {
  allColumns: string[];
  visibleColumns: Set<string>;
  onToggle: (column: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
};

const ColumnsSettings = ({
  allColumns,
  visibleColumns,
  onToggle,
  onShowAll,
  onHideAll,
}: Props) => {
  if (!allColumns.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">Columns</div>
        <div className="space-x-2">
          <button
            type="button"
            onClick={onShowAll}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
            aria-label="Show all columns">
            Show all
          </button>
          <button
            type="button"
            onClick={onHideAll}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
            aria-label="Hide all columns">
            Hide all
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {allColumns.map((col) => {
          const active = visibleColumns.has(col);
          return (
            <label key={col} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(col)}
                className="h-4 w-4"
                aria-label={`Toggle column ${col}`}
              />
              <span className="truncate">{col}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnsSettings;
