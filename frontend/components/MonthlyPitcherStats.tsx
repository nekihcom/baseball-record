import type { RecentGamePitcherRow } from "@/lib/statsTypes";
import { parseInnings } from "@/lib/utils";

type Props = {
  stats: RecentGamePitcherRow[] | null;
};

type MonthlyRow = {
  month: number;
  monthLabel: string;
  innings: number;
  earnedRuns: number;
  hitsAllowed: number;
  strikeouts: number;
  walksAllowed: number;
};

function getMonthNum(date: string | null): number | null {
  if (!date || date.length < 6) return null;
  const m = parseInt(date.slice(4, 6), 10);
  return m >= 1 && m <= 12 ? m : null;
}

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function MonthlyPitcherStats({ stats }: Props) {
  const source = Array.isArray(stats) ? stats : [];
  const groupMap = new Map<number, MonthlyRow>();

  for (let m = 1; m <= 12; m++) {
    groupMap.set(m, {
      month: m,
      monthLabel: MONTH_LABELS[m - 1],
      innings: 0,
      earnedRuns: 0,
      hitsAllowed: 0,
      strikeouts: 0,
      walksAllowed: 0,
    });
  }

  for (const row of source) {
    const monthNum = getMonthNum(row.date ?? null);
    if (monthNum == null) continue;
    const g = groupMap.get(monthNum)!;
    const ip = parseInnings(row.inning ?? null) ?? 0;
    g.innings += ip;
    g.earnedRuns += row.earned_runs ?? 0;
    g.hitsAllowed += row.hits_allowed ?? 0;
    g.strikeouts += row.strikeouts ?? 0;
    g.walksAllowed += row.walks_allowed ?? 0;
  }

  const rows = Array.from({ length: 12 }, (_, i) => groupMap.get(i + 1)!);

  const formatRate = (hasInnings: boolean, value: number | null): string => {
    if (!hasInnings || value == null || !Number.isFinite(value)) return "—";
    return value.toFixed(2);
  };

  const formatInnings = (ip: number): string => {
    if (!Number.isFinite(ip) || ip === 0) return "—";
    const whole = Math.floor(ip);
    const frac = ip - whole;
    if (frac < 0.01) return `${whole}回0/3`;
    if (Math.abs(frac - 0.33333) < 0.01) return whole > 0 ? `${whole}回1/3` : "0回1/3";
    if (Math.abs(frac - 0.66667) < 0.01) return whole > 0 ? `${whole}回2/3` : "0回2/3";
    return `${whole}回0/3`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">月</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">防御率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">投球回</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">被安打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">奪三振</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">四球</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">奪三振率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">WHIP</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">K/BB</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ip = row.innings;
            const hasInnings = ip > 0;
            const era = hasInnings ? (row.earnedRuns * 7 * 3) / (ip * 3) : null;
            const k9 = hasInnings ? (row.strikeouts * 7) / ip : null;
            const whip = hasInnings ? (row.hitsAllowed + row.walksAllowed) / ip : null;
            const kbb =
              hasInnings && row.walksAllowed > 0
                ? row.strikeouts / row.walksAllowed
                : null;
            return (
              <tr key={row.month} className="border-b last:border-b-0">
                <td className="px-2 py-1 whitespace-nowrap">{row.monthLabel}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(hasInnings, era)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatInnings(ip)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {hasInnings ? row.hitsAllowed : "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {hasInnings ? row.strikeouts : "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {hasInnings ? row.walksAllowed : "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(hasInnings, k9)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(hasInnings, whip)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(hasInnings, kbb)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
