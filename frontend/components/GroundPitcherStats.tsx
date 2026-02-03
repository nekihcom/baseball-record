import type { RecentGamePitcherRowWithPlace } from "@/lib/statsTypes";
import { parseInnings } from "@/lib/utils";

type Props = {
  stats: RecentGamePitcherRowWithPlace[] | null;
};

const UNREGISTERED = "未登録";

type AggregatedRow = {
  label: string;
  innings: number;
  earnedRuns: number;
  hitsAllowed: number;
  strikeouts: number;
  walksAllowed: number;
};

export function GroundPitcherStats({ stats }: Props) {
  const source = Array.isArray(stats) ? stats : [];
  const groupMap = new Map<string, AggregatedRow>();

  const ensureGroup = (key: string, label: string) => {
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        label,
        innings: 0,
        earnedRuns: 0,
        hitsAllowed: 0,
        strikeouts: 0,
        walksAllowed: 0,
      });
    }
    return groupMap.get(key)!;
  };

  for (const row of source) {
    const placeKey = (row.place ?? "").trim() || UNREGISTERED;
    const label = placeKey || UNREGISTERED;
    const g = ensureGroup(placeKey, label);
    const ip = parseInnings(row.inning ?? null) ?? 0;
    g.innings += ip;
    g.earnedRuns += row.earned_runs ?? 0;
    g.hitsAllowed += row.hits_allowed ?? 0;
    g.strikeouts += row.strikeouts ?? 0;
    g.walksAllowed += row.walks_allowed ?? 0;
  }

  const order = Array.from(groupMap.keys()).sort((a, b) => {
    if (a === UNREGISTERED) return 1;
    if (b === UNREGISTERED) return -1;
    return a.localeCompare(b);
  });
  const rows = order.map((key) => groupMap.get(key)!);

  const formatRate = (value: number | null, hasInnings: boolean): string => {
    if (!hasInnings) return "—";
    if (value == null || !Number.isFinite(value)) return "—";
    return value.toFixed(2);
  };

  /** 投球回を表示（●/3 を常に表示: 0/3, 1/3, 2/3） */
  const formatInnings = (ip: number): string => {
    if (!Number.isFinite(ip) || ip === 0) return "—";
    const whole = Math.floor(ip);
    const frac = ip - whole;
    if (frac < 0.01) return `${whole}回0/3`;
    if (Math.abs(frac - 0.33333) < 0.01) return whole > 0 ? `${whole}回1/3` : "0回1/3";
    if (Math.abs(frac - 0.66667) < 0.01) return whole > 0 ? `${whole}回2/3` : "0回2/3";
    return `${whole}回0/3`;
  };

  const hasAnyData = rows.some((r) => r.innings > 0);
  if (!hasAnyData) {
    return (
      <p className="text-sm text-muted-foreground">
        グラウンド別の成績はありません。
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">
              グラウンド
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              防御率
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              投球回
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              被安打
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              奪三振
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              四球
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              奪三振率
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              WHIP
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              K/BB
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ip = row.innings;
            const hasInnings = ip > 0;
            const era =
              hasInnings ? (row.earnedRuns * 7 * 3) / (ip * 3) : null;
            const k9 = hasInnings ? (row.strikeouts * 7) / ip : null;
            const whip =
              hasInnings
                ? (row.hitsAllowed + row.walksAllowed) / ip
                : null;
            const kbb =
              hasInnings && row.walksAllowed > 0
                ? row.strikeouts / row.walksAllowed
                : null;

            return (
              <tr key={row.label} className="border-b last:border-b-0">
                <td className="px-2 py-1 whitespace-nowrap">{row.label}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(era, hasInnings)}
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
                  {formatRate(k9, hasInnings)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(whip, hasInnings)}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {formatRate(kbb, hasInnings)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
