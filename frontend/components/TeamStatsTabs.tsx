"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { TeamStats, HitterStats, PitcherStats, Game } from "@/lib/types";
import { parseInnings } from "@/lib/utils";

export type MonthlyTeamStats = {
  month: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winning_pct: number | null;
  batting_avg: number | null;
  era: number | null;
};

type TeamStatsTabsProps = {
  currentYearTeamStats: TeamStats | null;
  careerTeamStats: TeamStats[] | null;
  currentYearHitterStats: HitterStats[] | null;
  careerHitterStats: HitterStats[] | null;
  currentYearPitcherStats: PitcherStats[] | null;
  careerPitcherStats: PitcherStats[] | null;
  last3Games?: Game[] | null;
  teamKey?: string;
  teamKeyToName?: Record<string, string>;
  monthlyStats?: MonthlyTeamStats[];
};

/** 選手名セル（teamKey があるとき /team/${teamKey}/player/${playerNumber} へのリンク） */
function PlayerNameCell({
  teamKey,
  playerNumber,
  displayText,
}: {
  teamKey?: string;
  playerNumber: number | null;
  displayText: string;
}) {
  if (teamKey != null && playerNumber != null) {
    return (
      <Link
        href={`/team/${teamKey}/player/${playerNumber}`}
        className="text-primary hover:underline"
      >
        {displayText || "—"}
      </Link>
    );
  }
  return <span>{displayText || "—"}</span>;
}

/** 勝率: 1.000はそのまま、10割未満は先頭0を省略して .750 のように表示 */
function formatWinningPercentage(value: number | null): string {
  if (value == null) return "—";
  return value >= 1 ? value.toFixed(3) : value.toFixed(3).slice(1);
}

function CurrentYearTeamSummaryTable({
  stats,
  emptyMessage = "チーム成績はありません。",
}: {
  stats: TeamStats | null;
  emptyMessage?: string;
}) {
  if (!stats) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">年</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">試合</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">負</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">分</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">得点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">失点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">本塁打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">盗塁</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">防御率</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b last:border-b-0">
            <td className="px-2 py-1 whitespace-nowrap">{stats.year ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.games ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.wins ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.losses ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.draws ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">
              {formatWinningPercentage(stats.winning_percentage)}
            </td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.runs_scored ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.runs_allowed ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">
              {stats.batting_average != null ? stats.batting_average.toFixed(3).slice(1) : "—"}
            </td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.home_runs ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">{stats.stolen_bases ?? "—"}</td>
            <td className="px-2 py-1 text-right whitespace-nowrap">
              {stats.earned_run_average != null ? stats.earned_run_average.toFixed(2) : "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Last3GamesTable({
  games,
  teamKey,
  teamKeyToName = {},
}: {
  games: Game[] | null | undefined;
  teamKey?: string;
  teamKeyToName?: Record<string, string>;
}) {
  if (!games || games.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2">直近3試合の成績</h3>
        <p className="text-sm text-muted-foreground">直近3試合の成績はありません。</p>
      </div>
    );
  }

  const getResultSymbol = (result: string | null) => {
    if (result === "勝ち") return "◯";
    if (result === "負け") return "⚫︎";
    return "—";
  };

  const getOpponentName = (game: Game) => {
    const topOrBottom = game.top_or_bottom;
    const key = topOrBottom === "top" ? game.bottom_team : game.top_team;
    return (key != null ? teamKeyToName[key] : null) ?? key ?? "—";
  };

  const formatDateYyyyMmDd = (dateStr: string | null): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr ?? "—";
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-2">直近3試合の成績</h3>
      <div className="w-full overflow-x-auto">
        <table className="min-w-max text-sm border-collapse">
          <thead className="bg-[#333333] text-white">
            <tr className="border-b">
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">日付</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">グラウンド</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">結果</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">対戦相手</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">勝利投手</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">敗戦投手</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">ホームラン</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const topOrBottom = game.top_or_bottom;
              const ourScore =
                topOrBottom === "top" ? game.top_team_score : game.bottom_team_score;
              const opponentScore =
                topOrBottom === "top" ? game.bottom_team_score : game.top_team_score;
              const resultStr = `${getResultSymbol(game.result)} ${ourScore ?? "—"}-${opponentScore ?? "—"}`;
              const winPitcher = game.result === "勝ち" ? (game.win_pitcher ?? "") : "";
              const losePitcher = game.result === "負け" ? (game.lose_pitcher ?? "") : "";
              return (
                <tr key={game.key} className="border-b last:border-b-0">
                  <td className="px-2 py-1 whitespace-nowrap">{formatDateYyyyMmDd(game.date)}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{game.place ?? "—"}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{resultStr}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{getOpponentName(game)}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{winPitcher || "—"}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{losePitcher || "—"}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{game.hr_player ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 16, right: 16, bottom: 28, left: 36 };

function MonthlyStatsSection({ monthlyStats = [] }: { monthlyStats?: MonthlyTeamStats[] }) {
  const lastMonthWithData = useMemo(() => {
    let last = 0;
    for (let i = 0; i < monthlyStats.length; i++) {
      if (monthlyStats[i].games > 0) last = i + 1;
    }
    return last;
  }, [monthlyStats]);

  const xScale = (month: number) =>
    CHART_PADDING.left +
    ((month - 1) / 11) * (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right);
  const yScale = (v: number) =>
    CHART_HEIGHT -
    CHART_PADDING.bottom -
    v * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);

  const maxEra = Math.max(
    ...monthlyStats.map((r) => r.era ?? 0),
    1
  );
  const points = {
    winning: monthlyStats
      .filter((_, i) => i + 1 <= lastMonthWithData)
      .map((r) => [xScale(r.month), yScale(r.winning_pct ?? 0)].join(","))
      .join(" "),
    batting: monthlyStats
      .filter((_, i) => i + 1 <= lastMonthWithData)
      .map((r) => [xScale(r.month), yScale(r.batting_avg ?? 0)].join(","))
      .join(" "),
    era: monthlyStats
      .filter((_, i) => i + 1 <= lastMonthWithData)
      .map((r) =>
        [xScale(r.month), yScale((r.era ?? 0) / maxEra)].join(",")
      )
      .join(" "),
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-2">月別成績</h3>
      <div className="mb-4 w-full overflow-x-auto">
        <svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          className="text-sm"
          role="img"
          aria-label="月別成績推移グラフ"
        >
          <line
            x1={CHART_PADDING.left}
            y1={CHART_HEIGHT - CHART_PADDING.bottom}
            x2={CHART_WIDTH - CHART_PADDING.right}
            y2={CHART_HEIGHT - CHART_PADDING.bottom}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <line
            x1={CHART_PADDING.left}
            y1={CHART_HEIGHT - CHART_PADDING.bottom}
            x2={CHART_PADDING.left}
            y2={CHART_PADDING.top}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
            <text
              key={m}
              x={xScale(m)}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {m}月
            </text>
          ))}
          {points.winning && (
            <polyline
              points={points.winning}
              fill="none"
              stroke="#2563eb"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.batting && (
            <polyline
              points={points.batting}
              fill="none"
              stroke="#16a34a"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.era && (
            <polyline
              points={points.era}
              fill="none"
              stroke="#dc2626"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-[#2563eb]">— 勝率</span>{" "}
          <span className="text-[#16a34a]">— 打率</span>{" "}
          <span className="text-[#dc2626]">— 防御率</span>（防御率は0～{maxEra.toFixed(1)}で正規化）
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-max text-sm border-collapse">
          <thead className="bg-[#333333] text-white">
            <tr className="border-b">
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">月</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">試合数</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">負</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">分</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝率</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打率</th>
              <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">防御率</th>
            </tr>
          </thead>
          <tbody>
            {monthlyStats.map((row) => (
              <tr key={row.month} className="border-b last:border-b-0">
                <td className="px-2 py-1 whitespace-nowrap">{row.month}月</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">{row.games}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">{row.wins}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">{row.losses}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">{row.draws}</td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.winning_pct != null ? formatWinningPercentage(row.winning_pct) : "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.batting_avg != null ? row.batting_avg.toFixed(3).slice(1) : "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {row.era != null ? row.era.toFixed(2) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CareerTeamSummaryTable({
  stats,
  emptyMessage = "通算チーム成績はありません。",
}: {
  stats: TeamStats[] | null;
  emptyMessage?: string;
}) {
  if (!stats || stats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  const sorted = [...stats].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b">
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">年</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">試合</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">敗</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">分</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">勝率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">得点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">失点</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">打率</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">本塁打</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">盗塁</th>
            <th className="px-2 py-1 text-right font-semibold whitespace-nowrap">防御率</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.key} className="border-b last:border-b-0">
              <td className="px-2 py-1 whitespace-nowrap">{row.year}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.games ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.wins ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.losses ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.draws ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatWinningPercentage(row.winning_percentage)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.runs_scored ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.runs_allowed ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.batting_average != null ? row.batting_average.toFixed(3).slice(1) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.home_runs ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.stolen_bases ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.earned_run_average != null ? row.earned_run_average.toFixed(2) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 打率・出塁率・長打率・OPS・得点圏打率の表示（0.350 → .350） */
function formatRate(value: number | null): string {
  if (value == null) return "—";
  return value >= 1 ? value.toFixed(3) : value.toFixed(3).slice(1);
}

/** 打率を小数点以下第4位で比較用に丸める */
function avgTo4Decimals(avg: number | null): number {
  if (avg == null) return -1;
  return Math.round(avg * 10000) / 10000;
}

/** 首位打者ブロックのみ（規定打席到達者の打率上位5人、同率は同順位・安打多い順） */
function BattingLeaderBlock({
  teamStats,
  hitterStats,
  teamKey,
}: {
  teamStats: TeamStats | null;
  hitterStats: HitterStats[] | null;
  teamKey?: string;
}) {
  const kitei_daseki = teamStats?.games != null ? Math.floor(teamStats.games * 1.25) : 0;
  const qualified = (hitterStats ?? []).filter(
    (row) =>
      (row.plate_appearance ?? 0) >= kitei_daseki &&
      [row.player_number, row.player].filter(Boolean).join(" ").trim() !== ""
  );
  const top5 = [...qualified]
    .sort((a, b) => {
      const avg4A = avgTo4Decimals(a.batting_average);
      const avg4B = avgTo4Decimals(b.batting_average);
      if (avg4A !== avg4B) return avg4B - avg4A;
      return (b.hit ?? 0) - (a.hit ?? 0);
    })
    .slice(0, 5);

  const ranksRef: number[] = top5.map((_, i) => (i === 0 ? 1 : 0));
  for (let i = 1; i < top5.length; i++) {
    const prevAvg4 = avgTo4Decimals(top5[i - 1].batting_average);
    const currAvg4 = avgTo4Decimals(top5[i].batting_average);
    ranksRef[i] = prevAvg4 === currAvg4 ? ranksRef[i - 1]! : i + 1;
  }

  if (top5.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold mb-2">首位打者</h3>
        <p className="text-sm text-muted-foreground">
          規定打席（{kitei_daseki}打席）に到達している選手はいません。
        </p>
      </div>
    );
  }

  return (
    <div className="flex">
    <div className="lg:w-full">
      <h3 className="text-sm font-semibold mb-2">首位打者</h3>
      <div className="w-full overflow-x-auto">
        <table className="min-w-max text-sm border-collapse lg:w-full">
          <thead className="bg-[#333333] text-white">
            <tr className="border-b">
              <th className="w-8 px-2 py-1 text-center font-semibold whitespace-nowrap">順位</th>
              <th className="w-20 px-2 py-1 text-left font-semibold whitespace-nowrap">選手</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">打率</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">打席</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">打数</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">安打</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((row, i) => (
              <tr key={row.key} className="border-b last:border-b-0">
                <td className="w-10 px-2 py-1 text-center whitespace-nowrap">{ranksRef[i]}</td>
                <td className="w-20 px-2 py-1 text-left whitespace-nowrap">
                  <PlayerNameCell
                    teamKey={teamKey}
                    playerNumber={row.player_number}
                    displayText={[row.player_number, row.player].filter(Boolean).join(" ") || "—"}
                  />
                </td>
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {formatRate(row.batting_average)}
                </td>
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {row.plate_appearance ?? "—"}
                </td>
                <td className="px-2 py-1 text-left whitespace-nowrap">{row.at_bats ?? "—"}</td>
                <td className="px-2 py-1 text-left whitespace-nowrap">{row.hit ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

/** 投手ランキングの追加列: key で PitcherStats の項目、または getValue で算出 */
type PitcherTitleRankingExtraColumn =
  | {
      key: keyof PitcherStats;
      label: string;
      formatValue?: (v: number | string | null) => string;
    }
  | {
      label: string;
      getValue: (row: PitcherStats) => number | string | null;
      formatValue?: (v: number | string | null) => string;
    };

function getPitcherExtraCellValue(
  row: PitcherStats,
  col: PitcherTitleRankingExtraColumn
): number | string | null {
  if ("key" in col) return row[col.key] as number | string | null;
  return col.getValue(row);
}

/** 投手・単一ランキング（規定投球回以上でフィルタし、上位5人を表示） */
function SimplePitcherTitleRanking({
  title,
  pitcherStats,
  kiteiInning,
  valueKey,
  valueLabel,
  formatValue,
  extraColumns = [],
  sortDesc = true,
  excludeZero = false,
  teamKey,
}: {
  title: string;
  pitcherStats: PitcherStats[] | null;
  kiteiInning: number;
  valueKey: keyof PitcherStats;
  valueLabel: string;
  formatValue?: (v: number | string | null) => string;
  extraColumns?: PitcherTitleRankingExtraColumn[];
  /** false のとき昇順（防御率など小さいほど良い） */
  sortDesc?: boolean;
  /** true のとき、メイン項目が 0 の投手をランキングから除外 */
  excludeZero?: boolean;
  teamKey?: string;
}) {
  const ipNum = (row: PitcherStats) =>
    parseInnings(row.innings_pitched) ?? 0;

  const getVal = (row: PitcherStats): number => {
    const v = row[valueKey];
    if (v == null) return sortDesc ? -Infinity : Infinity;
    if (valueKey === "innings_pitched")
      return typeof v === "string" ? ipNum(row) : Number(v) || 0;
    return typeof v === "number" ? v : Number(v) || (sortDesc ? -Infinity : Infinity);
  };

  let qualified = (pitcherStats ?? []).filter(
    (row) =>
      ipNum(row) >= kiteiInning &&
      [row.player_number, row.player].filter(Boolean).join(" ").trim() !== ""
  );
  if (excludeZero) {
    qualified = qualified.filter((row) => getVal(row) > 0);
  }

  const top5 = [...qualified]
    .sort((a, b) => (sortDesc ? getVal(b) - getVal(a) : getVal(a) - getVal(b)))
    .slice(0, 5);

  const ranksRef: number[] = top5.map((_, i) => (i === 0 ? 1 : 0));
  for (let i = 1; i < top5.length; i++) {
    const prevV = getVal(top5[i - 1]!);
    const currV = getVal(top5[i]!);
    const same = sortDesc ? prevV === currV : prevV === currV;
    ranksRef[i] = same ? ranksRef[i - 1]! : i + 1;
  }

  const display = (v: number | string | null) =>
    formatValue ? formatValue(v) : (v ?? "—").toString();

  const displayExtra = (row: PitcherStats, col: PitcherTitleRankingExtraColumn) => {
    const v = getPitcherExtraCellValue(row, col);
    const fmt = col.formatValue;
    return fmt ? fmt(v) : (v ?? "—").toString();
  };

  if (top5.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">該当者なし</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="lg:w-full">
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <div className="w-full overflow-x-auto">
          <table className="min-w-max text-sm border-collapse lg:w-full">
            <thead className="bg-[#333333] text-white">
              <tr className="border-b">
                <th className="w-8 px-2 py-1 text-center font-semibold whitespace-nowrap">順位</th>
                <th className="w-20 px-2 py-1 text-left font-semibold whitespace-nowrap">選手</th>
                <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">
                  {valueLabel}
                </th>
                {extraColumns.map((col) => (
                  <th
                    key={col.label}
                    className="px-2 py-1 text-left font-semibold whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top5.map((row, i) => (
                <tr key={row.key} className="border-b last:border-b-0">
                  <td className="w-10 px-2 py-1 text-center whitespace-nowrap">{ranksRef[i]}</td>
                  <td className="w-20 px-2 py-1 text-left whitespace-nowrap">
                    <PlayerNameCell
                      teamKey={teamKey}
                      playerNumber={row.player_number}
                      displayText={[row.player_number, row.player].filter(Boolean).join(" ") || "—"}
                    />
                  </td>
                  <td className="px-2 py-1 text-left whitespace-nowrap">
                    {display(
                      valueKey === "innings_pitched"
                        ? (row.innings_pitched as string | null)
                        : (row[valueKey] as number | null)
                    )}
                  </td>
                  {extraColumns.map((col) => (
                    <td
                      key={col.label}
                      className="px-2 py-1 text-left whitespace-nowrap"
                    >
                      {displayExtra(row, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** 投手・主要タイトルランキング（見出し＋規定投球回＋グリッドで勝利〜セーブ） */
function PitcherTitleRankingsSection({
  teamStats,
  pitcherStats,
  teamKey,
}: {
  teamStats: TeamStats | null;
  pitcherStats: PitcherStats[] | null;
  teamKey?: string;
}) {
  const games = teamStats?.games ?? 0;
  const kitei_inning = Math.floor(games * 0.6);
  const ruleText = `規定投球回：${kitei_inning}`;

  return (
    <div className="mt-18">
      <div className="flex flex-wrap items-baseline gap-2 mb-4">
        <h2 className="text-base font-semibold">主要タイトルランキング</h2>
        <span className="text-sm text-muted-foreground">{ruleText}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SimplePitcherTitleRanking
          title="勝利"
          pitcherStats={pitcherStats}
          kiteiInning={kitei_inning}
          valueKey="wins"
          valueLabel="勝利"
          excludeZero
          teamKey={teamKey}
          extraColumns={[
            { key: "games_played", label: "試合" },
            { key: "innings_pitched", label: "投球回" },
          ]}
        />
        <SimplePitcherTitleRanking
          title="勝率"
          pitcherStats={pitcherStats}
          kiteiInning={kitei_inning}
          valueKey="win_percentage"
          valueLabel="勝率"
          excludeZero
          teamKey={teamKey}
          formatValue={(v) =>
            v != null && typeof v === "number"
              ? (v >= 1 ? v.toFixed(3) : v.toFixed(3).slice(1))
              : "—"
          }
          extraColumns={[
            { key: "games_played", label: "試合" },
            { key: "wins", label: "勝" },
            { key: "losses", label: "負" },
          ]}
        />
        <SimplePitcherTitleRanking
          title="防御率"
          pitcherStats={pitcherStats}
          kiteiInning={kitei_inning}
          valueKey="era"
          valueLabel="防御率"
          sortDesc={false}
          teamKey={teamKey}
          formatValue={(v) =>
            v != null && typeof v === "number" ? v.toFixed(2) : "—"
          }
          extraColumns={[
            { key: "games_played", label: "試合" },
            { key: "innings_pitched", label: "投球回" },
          ]}
        />
        <SimplePitcherTitleRanking
          title="奪三振"
          pitcherStats={pitcherStats}
          kiteiInning={kitei_inning}
          valueKey="strikeouts"
          valueLabel="奪三振"
          excludeZero
          teamKey={teamKey}
          extraColumns={[
            { key: "innings_pitched", label: "投球回" },
            {
              key: "strikeout_rate",
              label: "奪三振率",
              formatValue: (v) =>
                v != null && typeof v === "number" ? v.toFixed(3) : "—",
            },
          ]}
        />
        <SimplePitcherTitleRanking
          title="投球回"
          pitcherStats={pitcherStats}
          kiteiInning={kitei_inning}
          valueKey="innings_pitched"
          valueLabel="投球回"
          teamKey={teamKey}
          extraColumns={[{ key: "games_played", label: "試合" }]}
        />
        <SimplePitcherTitleRanking
          title="セーブ"
          pitcherStats={pitcherStats}
          kiteiInning={kitei_inning}
          valueKey="saves"
          valueLabel="セーブ"
          excludeZero
          teamKey={teamKey}
          extraColumns={[{ key: "games_played", label: "試合" }]}
        />
      </div>
    </div>
  );
}

/** 主要タイトルランキング全体（見出し＋規定打席＋グリッドで首位打者〜犠飛） */
function TitleRankingsSection({
  teamStats,
  hitterStats,
  teamKey,
}: {
  teamStats: TeamStats | null;
  hitterStats: HitterStats[] | null;
  teamKey?: string;
}) {
  const games = teamStats?.games ?? 0;
  const kitei_daseki = Math.floor(games * 1.25);
  const ruleText = `規定打席：${kitei_daseki}`;

  return (
    <div className="mt-18">
      <div className="flex flex-wrap items-baseline gap-2 mb-4">
        <h2 className="text-base font-semibold">主要タイトルランキング</h2>
        <span className="text-sm text-muted-foreground">{ruleText}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BattingLeaderBlock teamStats={teamStats} hitterStats={hitterStats} teamKey={teamKey} />
        <SimpleTitleRanking
          title="安打"
          hitterStats={hitterStats}
          valueKey="hit"
          valueLabel="安打"
          teamKey={teamKey}
          extraColumns={[
            { key: "plate_appearance", label: "打席" },
            { key: "at_bats", label: "打数" },
          ]}
        />
        <SimpleTitleRanking
          title="本塁打"
          hitterStats={hitterStats}
          valueKey="hr"
          valueLabel="本塁打"
          teamKey={teamKey}
          extraColumns={[
            { key: "plate_appearance", label: "打席" },
            { key: "at_bats", label: "打数" },
          ]}
        />
        <SimpleTitleRanking
          title="打点"
          hitterStats={hitterStats}
          valueKey="rbi"
          valueLabel="打点"
          teamKey={teamKey}
          extraColumns={[
            { key: "plate_appearance", label: "打席" },
            { key: "at_bats", label: "打数" },
          ]}
        />
        <SimpleTitleRanking
          title="得点"
          hitterStats={hitterStats}
          valueKey="run"
          valueLabel="得点"
          teamKey={teamKey}
          extraColumns={[{ key: "on_base_percentage", label: "出塁率", formatValue: formatRate }]}
        />
        <SimpleTitleRanking
          title="盗塁"
          hitterStats={hitterStats}
          valueKey="stolen_base"
          valueLabel="盗塁"
          teamKey={teamKey}
          extraColumns={[{ key: "on_base_percentage", label: "出塁率", formatValue: formatRate }]}
        />
        <SimpleTitleRanking
          title="出塁率"
          hitterStats={hitterStats}
          valueKey="on_base_percentage"
          valueLabel="出塁率"
          teamKey={teamKey}
          formatValue={formatRate}
          extraColumns={[
            { key: "hit", label: "安打" },
            {
              label: "四死球",
              getValue: (row) => (row.walk ?? 0) + (row.hit_by_pitch ?? 0),
            },
            { key: "sacrifice_fly", label: "犠飛" },
          ]}
        />
        <SimpleTitleRanking
          title="犠打"
          hitterStats={hitterStats}
          valueKey="sacrifice_bunt"
          valueLabel="犠打"
          teamKey={teamKey}
          extraColumns={[{ key: "plate_appearance", label: "打席" }]}
        />
        <SimpleTitleRanking
          title="犠飛"
          hitterStats={hitterStats}
          valueKey="sacrifice_fly"
          valueLabel="犠飛"
          teamKey={teamKey}
          extraColumns={[{ key: "plate_appearance", label: "打席" }]}
        />
      </div>
    </div>
  );
}

/** 安打・本塁打・打点など値で並べるランキング（0は除外、同数は同順位、最大5人） */
/** ランキング表の追加列: key で HitterStats の項目、または getValue で算出 */
type TitleRankingExtraColumn =
  | { key: keyof HitterStats; label: string; formatValue?: (v: number | null) => string }
  | { label: string; getValue: (row: HitterStats) => number | null; formatValue?: (v: number | null) => string };

function getExtraCellValue(
  row: HitterStats,
  col: TitleRankingExtraColumn
): number | null {
  if ("key" in col) return row[col.key] as number | null;
  return col.getValue(row);
}

function SimpleTitleRanking({
  title,
  hitterStats,
  valueKey,
  valueLabel,
  formatValue,
  extraColumns = [],
  teamKey,
}: {
  title: string;
  hitterStats: HitterStats[] | null;
  valueKey: keyof HitterStats;
  valueLabel: string;
  formatValue?: (v: number | null) => string;
  extraColumns?: TitleRankingExtraColumn[];
  teamKey?: string;
}) {
  const getVal = (row: HitterStats) => {
    const v = row[valueKey];
    return v != null && typeof v === "number" ? v : 0;
  };
  const qualified = (hitterStats ?? []).filter(
    (row) =>
      getVal(row) > 0 &&
      [row.player_number, row.player].filter(Boolean).join(" ").trim() !== ""
  );
  const top5 = [...qualified]
    .sort((a, b) => getVal(b) - getVal(a))
    .slice(0, 5);

  const ranksRef: number[] = top5.map((_, i) => (i === 0 ? 1 : 0));
  for (let i = 1; i < top5.length; i++) {
    const prevV = getVal(top5[i - 1]!);
    const currV = getVal(top5[i]!);
    ranksRef[i] = prevV === currV ? ranksRef[i - 1]! : i + 1;
  }

  const display = (v: number | null) =>
    formatValue ? formatValue(v) : (v ?? "—").toString();

  const displayExtra = (row: HitterStats, col: TitleRankingExtraColumn) => {
    const v = getExtraCellValue(row, col);
    const fmt = col.formatValue;
    return fmt ? fmt(v) : (v ?? "—").toString();
  };

  if (top5.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">該当者なし</p>
      </div>
    );
  }

  return (
    <div className="flex">
    <div className="lg:w-full">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="w-full overflow-x-auto">
        <table className="min-w-max text-sm border-collapse lg:w-full">
          <thead className="bg-[#333333] text-white">
            <tr className="border-b">
              <th className="w-8 px-2 py-1 text-center font-semibold whitespace-nowrap">順位</th>
              <th className="w-20 px-2 py-1 text-left font-semibold whitespace-nowrap">選手</th>
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">
                {valueLabel}
              </th>
              {extraColumns.map((col) => (
                <th key={col.label} className="px-2 py-1 text-left font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top5.map((row, i) => (
              <tr key={row.key} className="border-b last:border-b-0">
                <td className="w-10 px-2 py-1 text-center whitespace-nowrap">{ranksRef[i]}</td>
                <td className="w-20 px-2 py-1 text-left whitespace-nowrap">
                  <PlayerNameCell
                    teamKey={teamKey}
                    playerNumber={row.player_number}
                    displayText={[row.player_number, row.player].filter(Boolean).join(" ") || "—"}
                  />
                </td>
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {display(row[valueKey] as number | null)}
                </td>
                {extraColumns.map((col) => (
                  <td key={col.label} className="px-2 py-1 text-left whitespace-nowrap">
                    {displayExtra(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

const HITTER_SORT_COLUMNS: { key: keyof HitterStats; label: string }[] = [
  { key: "games_played", label: "試合" },
  { key: "batting_average", label: "打率" },
  { key: "plate_appearance", label: "打席" },
  { key: "at_bats", label: "打数" },
  { key: "hit", label: "安打" },
  { key: "hr", label: "本塁打" },
  { key: "rbi", label: "打点" },
  { key: "run", label: "得点" },
  { key: "stolen_base", label: "盗塁" },
  { key: "on_base_percentage", label: "出塁率" },
  { key: "slugging_percentage", label: "長打率" },
  { key: "ops", label: "OPS" },
  { key: "average_in_scoring", label: "得点圏打率" },
  { key: "double", label: "二塁打" },
  { key: "triple", label: "三塁打" },
  { key: "total_bases", label: "塁打数" },
  { key: "strikeout", label: "三振" },
  { key: "walk", label: "四球" },
  { key: "hit_by_pitch", label: "死球" },
  { key: "sacrifice_bunt", label: "犠打" },
  { key: "sacrifice_fly", label: "犠飛" },
  { key: "double_play", label: "併殺打" },
  { key: "opponent_error", label: "敵失" },
  { key: "own_error", label: "失策" },
  { key: "caught_stealing", label: "盗塁阻止" },
];

function TeamHitterStatsTable({
  stats,
  emptyMessage = "打者成績はありません。",
  hideYearColumn = false,
  scrollableMaxHeight,
  teamKey,
}: {
  stats: HitterStats[] | null;
  emptyMessage?: string;
  hideYearColumn?: boolean;
  /** 指定時、この高さを超える部分は縦スクロールで表示（例: "400px", "50vh"） */
  scrollableMaxHeight?: string;
  teamKey?: string;
}) {
  const [sortKey, setSortKey] = useState<keyof HitterStats | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (!stats || stats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  const filtered = stats.filter(
    (row) => [row.player_number, row.player].filter(Boolean).join(" ").trim() !== ""
  );
  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const getNum = (row: HitterStats, key: keyof HitterStats): number => {
    const v = row[key];
    if (v == null) return -Infinity;
    return typeof v === "number" ? v : Number(v) || -Infinity;
  };
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) {
      return (b.year ?? 0) - (a.year ?? 0) || (a.player_number ?? 0) - (b.player_number ?? 0);
    }
    const va = getNum(a, sortKey);
    const vb = getNum(b, sortKey);
    if (va !== vb) return sortDir === "asc" ? va - vb : vb - va;
    return (a.player_number ?? 0) - (b.player_number ?? 0);
  });

  const handleSort = (key: keyof HitterStats) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div
      className="w-full overflow-x-auto"
      style={
        scrollableMaxHeight
          ? { maxHeight: scrollableMaxHeight, overflowY: "auto" as const }
          : undefined
      }
    >
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-[#333333]">
            {!hideYearColumn && (
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">年</th>
            )}
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">選手</th>
            {HITTER_SORT_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="px-2 py-1 text-right font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-[#444]"
                onClick={() => handleSort(key)}
              >
                {label}
                {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.key} className="border-b last:border-b-0">
              {!hideYearColumn && (
                <td className="px-2 py-1 whitespace-nowrap">{row.year ?? "—"}</td>
              )}
              <td className="px-2 py-1 whitespace-nowrap">
                <PlayerNameCell
                  teamKey={teamKey}
                  playerNumber={row.player_number}
                  displayText={[row.player_number, row.player].filter(Boolean).join(" ") || "—"}
                />
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.games_played ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.batting_average)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.plate_appearance ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.at_bats ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.hit ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.hr ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.rbi ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.run ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.stolen_base ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.on_base_percentage)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.slugging_percentage)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.ops != null ? row.ops.toFixed(3) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatRate(row.average_in_scoring)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.double ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.triple ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.total_bases ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.strikeout ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.walk ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.hit_by_pitch ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.sacrifice_bunt ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.sacrifice_fly ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.double_play ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.opponent_error ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.own_error ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.caught_stealing ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PITCHER_SORT_COLUMNS: { key: keyof PitcherStats; label: string }[] = [
  { key: "games_played", label: "試合" },
  { key: "era", label: "防御率" },
  { key: "wins", label: "勝" },
  { key: "losses", label: "負" },
  { key: "holds", label: "ホールド" },
  { key: "saves", label: "セーブ" },
  { key: "win_percentage", label: "勝率" },
  { key: "innings_pitched", label: "投球回" },
  { key: "pitches_thrown", label: "投球数" },
  { key: "runs_allowed", label: "失点" },
  { key: "earned_runs_allowed", label: "自責点" },
  { key: "complete_games", label: "完投" },
  { key: "shutouts", label: "完封" },
  { key: "hits_allowed", label: "被安打" },
  { key: "home_runs_allowed", label: "被本塁打" },
  { key: "strikeouts", label: "奪三振" },
  { key: "strikeout_rate", label: "奪三振率" },
  { key: "walks_allowed", label: "与四球" },
  { key: "hit_batters", label: "与死球" },
  { key: "balks", label: "ボーク" },
  { key: "wild_pitches", label: "暴投" },
  { key: "k_bb", label: "K/BB" },
  { key: "whip", label: "WHIP" },
];

function TeamPitcherStatsTable({
  stats,
  emptyMessage = "投手成績はありません。",
  hideYearColumn = false,
  scrollableMaxHeight,
  teamKey,
}: {
  stats: PitcherStats[] | null;
  emptyMessage?: string;
  hideYearColumn?: boolean;
  /** 指定時、この高さを超える部分は縦スクロールで表示（例: "400px", "50vh"） */
  scrollableMaxHeight?: string;
  teamKey?: string;
}) {
  const [sortKey, setSortKey] = useState<keyof PitcherStats | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (!stats || stats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  const filtered = stats.filter(
    (row) => [row.player_number, row.player].filter(Boolean).join(" ").trim() !== ""
  );
  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const getNum = (row: PitcherStats, key: keyof PitcherStats): number => {
    const v = row[key];
    if (v == null) return -Infinity;
    return typeof v === "number" ? v : Number(v) || -Infinity;
  };
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) {
      return (b.year ?? 0) - (a.year ?? 0) || (a.player_number ?? 0) - (b.player_number ?? 0);
    }
    const va = getNum(a, sortKey);
    const vb = getNum(b, sortKey);
    if (va !== vb) return sortDir === "asc" ? va - vb : vb - va;
    return (a.player_number ?? 0) - (b.player_number ?? 0);
  });

  const handleSort = (key: keyof PitcherStats) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div
      className="w-full overflow-x-auto"
      style={
        scrollableMaxHeight
          ? { maxHeight: scrollableMaxHeight, overflowY: "auto" as const }
          : undefined
      }
    >
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-[#333333] text-white">
          <tr className="border-b [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-[#333333]">
            {!hideYearColumn && (
              <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">年</th>
            )}
            <th className="px-2 py-1 text-left font-semibold whitespace-nowrap">選手</th>
            {PITCHER_SORT_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="px-2 py-1 text-right font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-[#444]"
                onClick={() => handleSort(key)}
              >
                {label}
                {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.key} className="border-b last:border-b-0">
              {!hideYearColumn && (
                <td className="px-2 py-1 whitespace-nowrap">{row.year ?? "—"}</td>
              )}
              <td className="px-2 py-1 whitespace-nowrap">
                <PlayerNameCell
                  teamKey={teamKey}
                  playerNumber={row.player_number}
                  displayText={[row.player_number, row.player].filter(Boolean).join(" ") || "—"}
                />
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.games_played ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.era != null ? row.era.toFixed(2) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.wins ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.losses ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.holds ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.saves ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {formatWinningPercentage(row.win_percentage)}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.innings_pitched ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.pitches_thrown ?? 0}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.runs_allowed ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.earned_runs_allowed ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.complete_games ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.shutouts ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.hits_allowed ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.home_runs_allowed ?? 0}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.strikeouts ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.strikeout_rate != null ? row.strikeout_rate.toFixed(3) : "—"}
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.walks_allowed ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.hit_batters ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.balks ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">{row.wild_pitches ?? "—"}</td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                {row.k_bb != null ? row.k_bb.toFixed(3) : "—"}
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

export function TeamStatsTabs({
  currentYearTeamStats,
  careerTeamStats,
  currentYearHitterStats,
  careerHitterStats,
  currentYearPitcherStats,
  careerPitcherStats,
  last3Games,
  teamKey,
  teamKeyToName,
  monthlyStats,
}: TeamStatsTabsProps) {
  const [careerTeamSelectedYears, setCareerTeamSelectedYears] = useState<number[]>([]);
  const [careerHitterSelectedYear, setCareerHitterSelectedYear] = useState<number | null>(null);
  const [careerPitcherSelectedYear, setCareerPitcherSelectedYear] = useState<number | null>(null);

  const careerTeamYears = useMemo(
    () =>
      [...new Set((careerTeamStats ?? []).map((s) => s.year).filter((y): y is number => y != null))].sort(
        (a, b) => b - a
      ),
    [careerTeamStats]
  );
  const careerHitterYears = useMemo(
    () =>
      [...new Set((careerHitterStats ?? []).map((s) => s.year).filter((y): y is number => y != null))].sort(
        (a, b) => b - a
      ),
    [careerHitterStats]
  );
  const careerPitcherYears = useMemo(
    () =>
      [...new Set((careerPitcherStats ?? []).map((s) => s.year).filter((y): y is number => y != null))].sort(
        (a, b) => b - a
      ),
    [careerPitcherStats]
  );

  useEffect(() => {
    if (careerTeamYears.length > 0) {
      setCareerTeamSelectedYears([...careerTeamYears]);
    }
  }, [careerTeamYears]);

  const filteredCareerTeamStats = useMemo(() => {
    if (!careerTeamStats || careerTeamStats.length === 0) return careerTeamStats;
    if (careerTeamSelectedYears.length === 0) return careerTeamStats;
    return careerTeamStats.filter(
      (s) => s.year != null && careerTeamSelectedYears.includes(s.year)
    );
  }, [careerTeamStats, careerTeamSelectedYears]);

  const effectiveHitterYear = careerHitterSelectedYear ?? careerHitterYears[0] ?? null;
  const filteredCareerHitterStats = useMemo(() => {
    if (!careerHitterStats || effectiveHitterYear == null) return careerHitterStats;
    return careerHitterStats.filter((s) => s.year === effectiveHitterYear);
  }, [careerHitterStats, effectiveHitterYear]);

  const effectivePitcherYear = careerPitcherSelectedYear ?? careerPitcherYears[0] ?? null;
  const filteredCareerPitcherStats = useMemo(() => {
    if (!careerPitcherStats || effectivePitcherYear == null) return careerPitcherStats;
    return careerPitcherStats.filter((s) => s.year === effectivePitcherYear);
  }, [careerPitcherStats, effectivePitcherYear]);

  const toggleCareerTeamYear = (year: number) => {
    setCareerTeamSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year].sort((a, b) => b - a)
    );
  };

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="current" className="flex-1">
          今シーズンの成績
        </TabsTrigger>
        <TabsTrigger value="career" className="flex-1">
          通算成績
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current" className="mt-4">
        <Tabs defaultValue="team" className="w-full">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="team" className="flex-1">
              チーム成績
            </TabsTrigger>
            <TabsTrigger value="hitter" className="flex-1">
              打者成績
            </TabsTrigger>
            <TabsTrigger value="pitcher" className="flex-1">
              投手成績
            </TabsTrigger>
          </TabsList>
          <TabsContent value="team" className="mt-4">
            <CurrentYearTeamSummaryTable
              stats={currentYearTeamStats}
              emptyMessage="今シーズンのチーム成績はありません。"
            />
            <Last3GamesTable
              games={last3Games}
              teamKey={teamKey}
              teamKeyToName={teamKeyToName}
            />
            <MonthlyStatsSection monthlyStats={monthlyStats} />
          </TabsContent>
          <TabsContent value="hitter" className="mt-4">
            <TeamHitterStatsTable
              stats={currentYearHitterStats}
              emptyMessage="今シーズンの打者成績はありません。"
              scrollableMaxHeight="400px"
              teamKey={teamKey}
            />
            <TitleRankingsSection
              teamStats={currentYearTeamStats}
              hitterStats={currentYearHitterStats}
              teamKey={teamKey}
            />
          </TabsContent>
          <TabsContent value="pitcher" className="mt-4">
            <TeamPitcherStatsTable
              stats={currentYearPitcherStats}
              emptyMessage="今シーズンの投手成績はありません。"
              scrollableMaxHeight="400px"
              teamKey={teamKey}
            />
            <PitcherTitleRankingsSection
              teamStats={currentYearTeamStats}
              pitcherStats={currentYearPitcherStats}
              teamKey={teamKey}
            />
          </TabsContent>
        </Tabs>
      </TabsContent>
      <TabsContent value="career" className="mt-4">
        <Tabs defaultValue="team" className="w-full">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="team" className="flex-1">
              チーム成績
            </TabsTrigger>
            <TabsTrigger value="hitter" className="flex-1">
              打者成績
            </TabsTrigger>
            <TabsTrigger value="pitcher" className="flex-1">
              投手成績
            </TabsTrigger>
          </TabsList>
          <TabsContent value="team" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">年</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[140px] justify-between">
                    {careerTeamSelectedYears.length === 0 ||
                    careerTeamSelectedYears.length === careerTeamYears.length
                      ? "全て"
                      : careerTeamSelectedYears.length <= 2
                        ? careerTeamSelectedYears.join(", ")
                        : `${careerTeamSelectedYears.length}件選択`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-[280px] overflow-y-auto">
                  <DropdownMenuItem
                    onSelect={() => setCareerTeamSelectedYears([...careerTeamYears])}
                  >
                    全て選択
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {careerTeamYears.map((year) => (
                    <DropdownMenuCheckboxItem
                      key={year}
                      checked={careerTeamSelectedYears.includes(year)}
                      onCheckedChange={() => toggleCareerTeamYear(year)}
                    >
                      {year}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CareerTeamSummaryTable
              stats={filteredCareerTeamStats}
              emptyMessage="通算チーム成績はありません。"
            />
          </TabsContent>
          <TabsContent value="hitter" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">年度</span>
              <Select
                value={effectiveHitterYear != null ? String(effectiveHitterYear) : ""}
                onValueChange={(v) => setCareerHitterSelectedYear(v === "" ? null : Number(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="年度" />
                </SelectTrigger>
                <SelectContent>
                  {careerHitterYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TeamHitterStatsTable
              stats={filteredCareerHitterStats}
              emptyMessage="通算打者成績はありません。"
              hideYearColumn
              scrollableMaxHeight="352px"
              teamKey={teamKey}
            />
          </TabsContent>
          <TabsContent value="pitcher" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">年度</span>
              <Select
                value={effectivePitcherYear != null ? String(effectivePitcherYear) : ""}
                onValueChange={(v) => setCareerPitcherSelectedYear(v === "" ? null : Number(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="年度" />
                </SelectTrigger>
                <SelectContent>
                  {careerPitcherYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TeamPitcherStatsTable
              stats={filteredCareerPitcherStats}
              emptyMessage="通算投手成績はありません。"
              hideYearColumn
              scrollableMaxHeight="352px"
              teamKey={teamKey}
            />
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}
