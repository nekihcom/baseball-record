import type { RecentGameHitterRow } from "@/lib/statsTypes";

type Props = {
  stats: RecentGameHitterRow[] | null;
};

type MonthlyRow = {
  month: number;
  monthLabel: string;
  pa: number;
  ab: number;
  hit: number;
  hr: number;
  rbi: number;
  sb: number;
  scoringAb: number;
  scoringHit: number;
  avg: number;
  scoringAvg: number;
  hasData: boolean;
};

function getMonthNum(date: string | null): number | null {
  if (!date || date.length < 6) return null;
  const m = parseInt(date.slice(4, 6), 10);
  return m >= 1 && m <= 12 ? m : null;
}

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function MonthlyHitterStats({ stats }: Props) {
  const source = Array.isArray(stats) ? stats : [];
  const groupMap = new Map<number, Omit<MonthlyRow, "avg" | "scoringAvg" | "hasData">>();

  for (let m = 1; m <= 12; m++) {
    groupMap.set(m, {
      month: m,
      monthLabel: MONTH_LABELS[m - 1],
      pa: 0,
      ab: 0,
      hit: 0,
      hr: 0,
      rbi: 0,
      sb: 0,
      scoringAb: 0,
      scoringHit: 0,
    });
  }

  for (const row of source) {
    const monthNum = getMonthNum(row.date ?? null);
    if (monthNum == null) continue;
    const g = groupMap.get(monthNum)!;
    g.pa += row.plate_apperance ?? 0;
    g.ab += row.at_bat ?? 0;
    g.hit += row.hit ?? 0;
    g.hr += row.hr ?? 0;
    g.rbi += row.rbi ?? 0;
    g.sb += row.stolen_base ?? 0;
    g.scoringAb += row.at_bat_in_scoring ?? 0;
    g.scoringHit += row.hit_in_scoring ?? 0;
  }

  const rows: MonthlyRow[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const g = groupMap.get(m)!;
    const ab = g.ab;
    const hit = g.hit;
    const sAb = g.scoringAb;
    const sHit = g.scoringHit;
    const avg = ab > 0 ? hit / ab : 0;
    const scoringAvg = sAb > 0 ? sHit / sAb : 0;
    const hasData = ab > 0 || g.pa > 0;
    return { ...g, avg, scoringAvg, hasData };
  });

  const formatRate = (hasData: boolean, value: number | null) =>
    hasData && value != null ? value.toFixed(3).slice(1) : "—";

  const formatInt = (hasData: boolean, value: number) =>
    hasData ? value : "—";

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">月</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打席</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打数</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">安打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">本塁打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">盗塁</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">得点圏打率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">得点圏打数</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">得点圏安打</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="border-b last:border-b-0">
              <td className="px-2 py-1 whitespace-nowrap">{row.monthLabel}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.hasData, row.avg)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.pa)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.ab)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.hit)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.hr)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.rbi)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.sb)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.hasData, row.scoringAvg)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.scoringAb)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatInt(row.hasData, row.scoringHit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
