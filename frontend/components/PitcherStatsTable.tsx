import type { CareerPitcherRow } from "@/lib/statsTypes";

type PitcherStatsTableProps = {
  stats: CareerPitcherRow | CareerPitcherRow[] | null;
  emptyMessage?: string;
};

export function PitcherStatsTable({ stats, emptyMessage = "投手成績はありません。" }: PitcherStatsTableProps) {
  if (!stats) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const statsArray = Array.isArray(stats) ? stats : [stats];
  const sortedStats = [...statsArray].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  if (sortedStats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">年度</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">登板</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">敗</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">H</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">S</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">防御率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">投球回</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">投球数</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">失点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">自責点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">被本塁打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">奪三振</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">与四球</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">WHIP</th>
          </tr>
        </thead>
        <tbody>
          {sortedStats.map((row) => (
            <tr key={row.year} className="border-b last:border-b-0">
              <td className="px-2 py-1 whitespace-nowrap">{row.year}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.games_played ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.wins ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.losses ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.holds ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.saves ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.win_percentage != null
                  ? row.win_percentage.toFixed(3).slice(1)
                  : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.era != null ? row.era.toFixed(2) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.innings_pitched ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.pitches_thrown ?? 0}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.runs_allowed ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.earned_runs_allowed ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.home_runs_allowed ?? 0}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.strikeouts ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.walks_allowed ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.whip != null ? row.whip.toFixed(3) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
