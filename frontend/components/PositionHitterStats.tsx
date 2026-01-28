import type { RecentGameHitterRow } from "@/lib/statsTypes";

type Props = {
  stats: RecentGameHitterRow[] | null;
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

const POSITION_LABELS: string[] = ["投", "捕", "一", "二", "三", "遊", "左", "中", "右", "DH"];

function normalizePosition(pos: string | null): string | null {
  if (!pos) return null;
  // そのまま一致を優先
  if (POSITION_LABELS.includes(pos)) return pos;
  // 先頭1文字でのマッピング（例: 「投手」→「投」など）
  const first = pos[0];
  const map: Record<string, string> = {
    "投": "投",
    "捕": "捕",
    "一": "一",
    "二": "二",
    "三": "三",
    "遊": "遊",
    "左": "左",
    "中": "中",
    "右": "右",
    "指": "DH",
  };
  return map[first] ?? null;
}

export function PositionHitterStats({ stats }: Props) {
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

  for (const row of source) {
    const posKey = normalizePosition(row.position ?? null);
    if (!posKey) continue;
    const g = ensureGroup(posKey, posKey);
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

  const pushRow = (label: string) => {
    const g = groupMap.get(label);
    if (!g || !g.hasData) {
      rows.push({ ...emptyRow, label });
      return;
    }
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
  };

  POSITION_LABELS.forEach((label) => pushRow(label));

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ポジション別の打者成績はありません。
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
              ポジション
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

