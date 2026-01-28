import type { CareerHitterRow } from "@/lib/statsTypes";

type HitterStatsTableProps = {
  stats: CareerHitterRow | CareerHitterRow[] | null;
  emptyMessage?: string;
};

export function HitterStatsTable({ stats, emptyMessage = "打者成績はありません。" }: HitterStatsTableProps) {
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
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">試合</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打席</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打数</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">安打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">本塁打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">得点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">盗塁</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">出塁率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">長打率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">OPS</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">三振</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">四球</th>
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
                {row.batting_average != null ? row.batting_average.toFixed(3).slice(1) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.plate_appearance ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.at_bats ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.hit ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.hr ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.rbi ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.run ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.stolen_base ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.on_base_percentage != null
                  ? row.on_base_percentage.toFixed(3).slice(1)
                  : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.slugging_percentage != null
                  ? row.slugging_percentage.toFixed(3).slice(1)
                  : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.ops != null ? row.ops.toFixed(3) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.strikeout ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.walk ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
