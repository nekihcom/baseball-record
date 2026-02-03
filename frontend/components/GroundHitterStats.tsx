import type { RecentGameHitterRowWithPlace } from "@/lib/statsTypes";

type Props = {
  stats: RecentGameHitterRowWithPlace[] | null;
};

type AggregatedRow = {
  label: string;
  hasData: boolean;
  pa: number | null;
  ab: number | null;
  hit: number | null;
  hr: number | null;
  rbi: number | null;
  sb: number | null;
  avg: number | null;
  scoringAvg: number | null;
  scoringAb: number | null;
  scoringHit: number | null;
};

export function GroundHitterStats({ stats }: Props) {
  const emptyRow: AggregatedRow = {
    label: "",
    hasData: false,
    pa: null,
    ab: null,
    hit: null,
    hr: null,
    rbi: null,
    sb: null,
    avg: null,
    scoringAvg: null,
    scoringAb: null,
    scoringHit: null,
  };

  const rows: AggregatedRow[] = [];
  const source = Array.isArray(stats) ? stats : [];

  const groupMap = new Map<string, AggregatedRow>();

  const ensureGroup = (key: string, label: string) => {
    if (!groupMap.has(key)) {
      groupMap.set(key, { ...emptyRow, label });
    }
    return groupMap.get(key)!;
  };

  const UNREGISTERED = "未登録";
  for (const row of source) {
    const placeKey = (row.place ?? "").trim() || UNREGISTERED;
    const label = placeKey || UNREGISTERED;
    const g = ensureGroup(placeKey, label);
    g.hasData = true;
    g.pa = (g.pa ?? 0) + (row.plate_apperance ?? 0);
    g.ab = (g.ab ?? 0) + (row.at_bat ?? 0);
    g.hit = (g.hit ?? 0) + (row.hit ?? 0);
    g.hr = (g.hr ?? 0) + (row.hr ?? 0);
    g.rbi = (g.rbi ?? 0) + (row.rbi ?? 0);
    g.sb = (g.sb ?? 0) + (row.stolen_base ?? 0);
    g.scoringAb = (g.scoringAb ?? 0) + (row.at_bat_in_scoring ?? 0);
    g.scoringHit = (g.scoringHit ?? 0) + (row.hit_in_scoring ?? 0);
  }

  const order = Array.from(groupMap.keys()).sort((a, b) => {
    if (a === UNREGISTERED) return 1;
    if (b === UNREGISTERED) return -1;
    return a.localeCompare(b);
  });
  order.forEach((key) => {
    const g = groupMap.get(key)!;
    const ab = g.ab ?? 0;
    const hit = g.hit ?? 0;
    const sAb = g.scoringAb ?? 0;
    const sHit = g.scoringHit ?? 0;
    const avg = ab > 0 ? hit / ab : 0;
    const scoringAvg = sAb > 0 ? sHit / sAb : 0;
    rows.push({
      ...g,
      avg,
      scoringAvg,
    });
  });

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        グラウンド別の打者成績はありません。
      </p>
    );
  }

  const formatRate = (value: number | null) =>
    value != null ? value.toFixed(3).slice(1) : "—";

  const formatInt = (hasData: boolean, value: number | null) =>
    hasData ? (value ?? 0) : "—";

  const formatScoringInt = (hasData: boolean, scoringAb: number | null, value: number | null) => {
    if (!hasData) return "—";
    if ((scoringAb ?? 0) === 0) return "—";
    return value ?? 0;
  };

  const formatScoringRate = (hasData: boolean, scoringAb: number | null, value: number | null) => {
    if (!hasData) return "—";
    if ((scoringAb ?? 0) === 0) return "—";
    return value != null ? value.toFixed(3).slice(1) : "—";
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">
              グラウンド
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              打率
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              打席
            </th>
            <th className="px-2 py-1 text-right  font-semibold whitespace-nowrap">
              打数
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              安打
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              本塁打
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              打点
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              盗塁
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              得点圏打率
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              得点圏打数
            </th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">
              得点圏安打
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-b-0">
              <td className="px-2 py-1 whitespace-nowrap">{row.label}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.avg)}
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
                {formatScoringRate(row.hasData, row.scoringAb, row.scoringAvg)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatScoringInt(row.hasData, row.scoringAb, row.scoringAb)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatScoringInt(row.hasData, row.scoringAb, row.scoringHit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
