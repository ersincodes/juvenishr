import { Metrics } from "@/utils/metrics";

type Props = {
  metrics: Metrics;
};

const MetricsBar = ({ metrics }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="text-xs text-zinc-600">Total records</div>
        <div className="mt-1 text-2xl font-semibold">{metrics.total}</div>
      </div>
      {metrics.byKey ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-xs text-zinc-600">
            Counts by {metrics.byKey.key}
          </div>
          <div className="mt-2 text-sm text-zinc-800 space-y-1">
            {Object.entries(metrics.byKey.counts)
              .slice(0, 5)
              .map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="truncate">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MetricsBar;
