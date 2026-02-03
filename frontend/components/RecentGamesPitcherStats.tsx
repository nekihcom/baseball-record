import type { RecentGamePitcherRow } from "@/lib/statsTypes";
import { parseInnings } from "@/lib/utils";

type RecentGamesPitcherStatsProps = {
  stats: RecentGamePitcherRow[] | null;
  emptyMessage?: string;
};

function formatRate(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

export function RecentGamesPitcherStats({
  stats,
  emptyMessage = "直近3試合の成績はありません。",
}: RecentGamesPitcherStatsProps) {
  if (!stats || stats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr || "—";
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  };

  const formatOrder = (order: number | null): string => {
    if (order == null) return "—";
    return order === 1 ? "先発" : "救援";
  };

  const top3 = stats.slice(0, 3);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">試合日</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">登板順</th>
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">勝敗</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">投球回</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">失点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">自責点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">被安打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">奪三振</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">与四死球</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">奪三振率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">WHIP</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">K/BB</th>
          </tr>
        </thead>
        <tbody>
          {top3.map((row, index) => {
            const bb = row.walks_allowed ?? 0;
            const hbp = row.hit_batsmen ?? 0;
            const totalBBHbp = bb + hbp;
            const innings = parseInnings(row.inning ?? null);

            const k9 =
              innings && innings > 0 ? ((row.strikeouts ?? 0) * 7) / innings : null;
            const whip =
              innings && innings > 0
                ? ((row.hits_allowed ?? 0) + (row.walks_allowed ?? 0)) / innings
                : null;
            const kbb =
              (row.walks_allowed ?? 0) > 0
                ? (row.strikeouts ?? 0) / (row.walks_allowed ?? 0)
                : null;
            return (
              <tr key={index} className="border-b last:border-b-0">
                <td className="px-2 py-1 whitespace-nowrap">{formatDate(row.date)}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatOrder(row.order)}
                </td>
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {row.result ?? "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.inning ?? "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.runs_allowed ?? "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.earned_runs ?? "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.hits_allowed ?? "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.strikeouts ?? "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {totalBBHbp}
                </td>
                 <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(k9)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(whip)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(kbb)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
