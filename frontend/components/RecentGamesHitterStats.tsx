import type { RecentGameHitterRow } from "@/lib/statsTypes";

type RecentGamesHitterStatsProps = {
  stats: RecentGameHitterRow[] | null;
  emptyMessage?: string;
};

export function RecentGamesHitterStats({
  stats,
  emptyMessage = "直近3試合の成績はありません。",
}: RecentGamesHitterStatsProps) {
  if (!stats || stats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  // 日付をフォーマット（yyyymmdd -> yyyy/mm/dd）
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr || "—";
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  };

  const top3 = stats.slice(0, 3);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">日付</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打順</th>
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">守備位置</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打席</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打数</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">安打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">本塁打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">盗塁</th>
          </tr>
        </thead>
        <tbody>
          {top3.map((row, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="px-2 py-1 whitespace-nowrap">{formatDate(row.date)}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.order ?? "—"}
              </td>
              <td className="px-2 py-1 text-left whitespace-nowrap">
                {row.position ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.plate_apperance ?? "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.at_bat ?? "—"}
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
                {row.stolen_base ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
