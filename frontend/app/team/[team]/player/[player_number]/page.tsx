"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatsTabs } from "@/components/PlayerStatsTabs";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import type {
  CareerHitterRow,
  CareerPitcherRow,
  RecentGameHitterRow,
  RecentGameHitterRowWithPlace,
  RecentGamePitcherRow,
  RecentGamePitcherRowWithPlace,
  SeasonHitterStats,
  SeasonPitcherStats,
} from "@/lib/statsTypes";

/** 投球回表記 "6回1/3" を小数に変換 */
function parseInningToDecimal(inning: string | null): number {
  if (!inning || typeof inning !== "string") return 0;
  const match = inning.match(/^(\d+)回(?:(\d+)\/(\d+))?$/);
  if (!match) return 0;
  const full = parseInt(match[1], 10) || 0;
  const num = match[2] ? parseInt(match[2], 10) || 0 : 0;
  const denom = match[3] ? parseInt(match[3], 10) || 1 : 1;
  return full + num / denom;
}

type GamePitcherRowForAgg = {
  date: string | null;
  result: string | null;
  inning: string | null;
  runs_allowed: number | null;
  earned_runs: number | null;
  hits_allowed: number | null;
  strikeouts: number | null;
  walks_allowed: number | null;
  hit_batsmen: number | null;
};

/** 試合別投手成績を年度別に集計して CareerPitcherRow の配列を返す */
function aggregateGamePitcherStatsByYear(
  games: GamePitcherRowForAgg[]
): CareerPitcherRow[] {
  const byYear = new Map<
    number,
    {
      games_played: number;
      wins: number;
      losses: number;
      holds: number;
      saves: number;
      runs_allowed: number;
      earned_runs_allowed: number;
      hits_allowed: number;
      strikeouts: number;
      walks_allowed: number;
      hit_batsmen: number;
      inningsDecimal: number;
    }
  >();
  for (const row of games) {
    const yearStr = row.date?.slice(0, 4);
    const year = yearStr ? parseInt(yearStr, 10) : null;
    if (year == null || isNaN(year)) continue;
    const cur = byYear.get(year) ?? {
      games_played: 0,
      wins: 0,
      losses: 0,
      holds: 0,
      saves: 0,
      runs_allowed: 0,
      earned_runs_allowed: 0,
      hits_allowed: 0,
      strikeouts: 0,
      walks_allowed: 0,
      hit_batsmen: 0,
      inningsDecimal: 0,
    };
    cur.games_played += 1;
    const result = (row.result ?? "").trim();
    if (result === "勝") cur.wins += 1;
    else if (result === "敗") cur.losses += 1;
    else if (result === "H") cur.holds += 1;
    else if (result === "S") cur.saves += 1;
    cur.runs_allowed += row.runs_allowed ?? 0;
    cur.earned_runs_allowed += row.earned_runs ?? 0;
    cur.hits_allowed += row.hits_allowed ?? 0;
    cur.strikeouts += row.strikeouts ?? 0;
    cur.walks_allowed += row.walks_allowed ?? 0;
    cur.hit_batsmen += row.hit_batsmen ?? 0;
    cur.inningsDecimal += parseInningToDecimal(row.inning);
    byYear.set(year, cur);
  }
  const rows: CareerPitcherRow[] = [];
  for (const [year, cur] of byYear.entries()) {
    const innings = cur.inningsDecimal;
    const winPct =
      cur.wins + cur.losses > 0
        ? cur.wins / (cur.wins + cur.losses)
        : null;
    const era = innings > 0 ? (cur.earned_runs_allowed * 9) / innings : null;
    const whip =
      innings > 0
        ? (cur.hits_allowed + cur.walks_allowed) / innings
        : null;
    rows.push({
      year,
      games_played: cur.games_played,
      wins: cur.wins,
      losses: cur.losses,
      holds: cur.holds,
      saves: cur.saves,
      win_percentage: winPct,
      era: era != null ? Math.round(era * 100) / 100 : null,
      innings_pitched:
        innings > 0 ? innings.toFixed(2) : "0",
      pitches_thrown: null,
      runs_allowed: cur.runs_allowed,
      earned_runs_allowed: cur.earned_runs_allowed,
      strikeouts: cur.strikeouts,
      walks_allowed: cur.walks_allowed,
      home_runs_allowed: null,
      whip: whip != null ? Math.round(whip * 1000) / 1000 : null,
    });
  }
  return rows;
}

type Props = { params: Promise<{ team: string; player_number: string }> };

export default function TeamPlayerDetailPage({ params }: Props) {
  const { setBreadcrumbSegments, clearBreadcrumb } = useBreadcrumb();
  const [team, setTeam] = useState<string>("");
  const [playerNumber, setPlayerNumber] = useState<string>("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [hasCurrentYearPitcherStats, setHasCurrentYearPitcherStats] = useState(false);
  const [hasCareerPitcherStats, setHasCareerPitcherStats] = useState(false);
  const [currentYearHitterStats, setCurrentYearHitterStats] = useState<SeasonHitterStats | null>(null);
  const [currentYearPitcherStats, setCurrentYearPitcherStats] = useState<SeasonPitcherStats | null>(null);
  const [careerHitterStats, setCareerHitterStats] = useState<CareerHitterRow[] | null>(null);
  const [careerPitcherStats, setCareerPitcherStats] = useState<CareerPitcherRow[] | null>(null);
  const [recentGamesHitterStats, setRecentGamesHitterStats] = useState<RecentGameHitterRow[] | null>(null);
  const [recentGamesHitterStatsWithPlace, setRecentGamesHitterStatsWithPlace] =
    useState<RecentGameHitterRowWithPlace[] | null>(null);
  const [recentGamesPitcherStats, setRecentGamesPitcherStats] = useState<RecentGamePitcherRow[] | null>(null);
  const [recentGamesPitcherStatsWithPlace, setRecentGamesPitcherStatsWithPlace] =
    useState<RecentGamePitcherRowWithPlace[] | null>(null);
  const [careerGamesHitterStats, setCareerGamesHitterStats] = useState<RecentGameHitterRow[] | null>(null);
  const [careerGamesHitterStatsWithPlace, setCareerGamesHitterStatsWithPlace] =
    useState<RecentGameHitterRowWithPlace[] | null>(null);
  const [careerGamesPitcherStats, setCareerGamesPitcherStats] = useState<RecentGamePitcherRow[] | null>(null);
  const [careerGamesPitcherStatsWithPlace, setCareerGamesPitcherStatsWithPlace] =
    useState<RecentGamePitcherRowWithPlace[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setTeam(resolvedParams.team);
      setPlayerNumber(resolvedParams.player_number);
      setError(null);
    });
  }, [params]);

  useEffect(() => {
    if (!team || !playerNumber) return;

    async function fetchPlayer() {
      try {
        setLoading(true);
        setError(null);
        setHasCurrentYearPitcherStats(false);
        setHasCareerPitcherStats(false);
        setCurrentYearHitterStats(null);
        setCurrentYearPitcherStats(null);
        setCareerHitterStats(null);
        setCareerPitcherStats(null);
        setRecentGamesHitterStats(null);
        setRecentGamesHitterStatsWithPlace(null);
        setRecentGamesPitcherStats(null);
        setRecentGamesPitcherStatsWithPlace(null);
        setCareerGamesHitterStats(null);
        setCareerGamesHitterStatsWithPlace(null);
        setCareerGamesPitcherStats(null);
        setCareerGamesPitcherStatsWithPlace(null);

        const playerNumberInt = parseInt(playerNumber, 10);
        if (isNaN(playerNumberInt)) {
          setError("無効な背番号です");
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("master_players_info")
          .select("*")
          .eq("team", team)
          .eq("player_number", playerNumberInt)
          .eq("delete_flg", 0)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setPlayer(data as Player);

        const currentYear = new Date().getFullYear();
        const playerName = (data as Player).player_name;
        const hitterKey = `${team}_${currentYear}_${playerNumberInt}_${playerName}`;

        const [
          { data: currentYearHitterData, error: currentYearHitterError },
          { data: currentYearPitcherData, error: currentPitcherError },
          { data: careerPitcherSummary, error: careerPitcherError },
          { data: hitterStats, error: hitterError },
          { data: pitcherStats, error: pitcherError },
          { data: recentGamesData, error: recentGamesError },
          { data: gameInfoData, error: gameInfoError },
          { data: recentGamesPitcherData, error: recentGamesPitcherError },
          { data: careerGameHitterData, error: careerGameHitterError },
          { data: careerGameInfoData, error: careerGameInfoError },
          { data: careerGamePitcherData, error: careerGamePitcherError },
        ] = await Promise.all([
          supabase
            .from("transaction_hitter_stats")
            .select(
              "year,games_played,batting_average,plate_appearance,at_bats,hit,hr,rbi,run,stolen_base,on_base_percentage,slugging_percentage,average_in_scoring,ops,strikeout,walk,double,triple,total_bases,hit_by_pitch,sacrifice_bunt,sacrifice_fly,double_play,opponent_error,own_error,caught_stealing"
            )
            .eq("key", hitterKey)
            .eq("delete_flg", 0)
            .single(),
          supabase
            .from("transaction_pitcher_stats")
            .select(
              "year,games_played,wins,losses,holds,saves,win_percentage,era,innings_pitched,pitches_thrown,runs_allowed,earned_runs_allowed,strikeouts,walks_allowed,home_runs_allowed,whip"
            )
            .eq("team", team)
            .eq("player_number", playerNumberInt)
            .eq("year", currentYear)
            .eq("delete_flg", 0)
            .single(),
          supabase
            .from("transaction_pitcher_stats")
            .select("key")
            .eq("team", team)
            .eq("player_number", playerNumberInt)
            .eq("delete_flg", 0)
            .limit(1),
          supabase
            .from("transaction_hitter_stats")
            .select(
              "year,games_played,batting_average,plate_appearance,at_bats,hit,hr,rbi,run,stolen_base,on_base_percentage,slugging_percentage,ops,strikeout,walk"
            )
            .eq("team", team)
            .eq("player_number", playerNumberInt)
            .eq("delete_flg", 0)
            .order("year", { ascending: false }),
          supabase
            .from("transaction_pitcher_stats")
            .select(
              "year,games_played,wins,losses,holds,saves,win_percentage,era,innings_pitched,pitches_thrown,runs_allowed,earned_runs_allowed,strikeouts,walks_allowed,home_runs_allowed,whip"
            )
            .eq("team", team)
            .eq("player_number", playerNumberInt)
            .eq("delete_flg", 0)
            .order("year", { ascending: false }),
          supabase
            .from("transaction_game_hitter_stats")
            .select(
              "date,start_time,url,order,position,plate_apperance,at_bat,hit,hr,rbi,stolen_base,at_bat_in_scoring,hit_in_scoring"
            )
            .eq("team", team)
            .eq("player", playerName)
            .eq("delete_flg", 0)
            .like("date", `${currentYear}%`)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false }),
          supabase
            .from("transaction_game_info")
            .select("url,place")
            .eq("team", team)
            .eq("delete_flg", 0)
            .like("date", `${currentYear}%`),
          supabase
            .from("transaction_game_pitcher_stats")
            .select(
              "date,start_time,url,order,result,inning,runs_allowed,earned_runs,hits_allowed,strikeouts,walks_allowed,hit_batsmen"
            )
            .eq("team", team)
            .eq("player", playerName)
            .eq("delete_flg", 0)
            .like("date", `${currentYear}%`)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false }),
          supabase
            .from("transaction_game_hitter_stats")
            .select(
              "date,start_time,url,order,position,plate_apperance,at_bat,hit,hr,rbi,stolen_base,at_bat_in_scoring,hit_in_scoring"
            )
            .eq("team", team)
            .eq("player", playerName)
            .eq("delete_flg", 0)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false }),
          supabase
            .from("transaction_game_info")
            .select("url,place")
            .eq("team", team)
            .eq("delete_flg", 0),
          supabase
            .from("transaction_game_pitcher_stats")
            .select(
              "date,start_time,url,order,result,inning,runs_allowed,earned_runs,hits_allowed,strikeouts,walks_allowed,hit_batsmen"
            )
            .eq("team", team)
            .eq("player", playerName)
            .eq("delete_flg", 0)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false }),
        ]);

        // PGRST116 = 行が0件（.single()で該当なし）。成績なしは想定内のためエラーログは出さない
        if (currentYearHitterError) {
          if (currentYearHitterError.code !== "PGRST116") {
            console.error("今シーズンの打者成績の取得に失敗しました:", currentYearHitterError);
          }
        } else if (currentYearHitterData) {
          setCurrentYearHitterStats(currentYearHitterData as SeasonHitterStats);
        }

        if (currentPitcherError) {
          if (currentPitcherError.code !== "PGRST116") {
            console.error("今シーズンの投手成績の取得に失敗しました:", currentPitcherError);
          }
          setHasCurrentYearPitcherStats(false);
          setCurrentYearPitcherStats(null);
        } else if (currentYearPitcherData) {
          setHasCurrentYearPitcherStats(true);
          setCurrentYearPitcherStats(currentYearPitcherData as SeasonPitcherStats);
        } else {
          setHasCurrentYearPitcherStats(false);
          setCurrentYearPitcherStats(null);
        }

        if (careerPitcherError) {
          if (careerPitcherError.code !== "PGRST116") {
            console.error("通算投手成績の取得に失敗しました:", careerPitcherError);
          }
          setHasCareerPitcherStats(false);
          setCareerPitcherStats(null);
        } else {
          const hasCareerPitcher =
            Array.isArray(careerPitcherSummary) && careerPitcherSummary.length > 0;
          setHasCareerPitcherStats(hasCareerPitcher);
          if (!hasCareerPitcher) {
            setCareerPitcherStats(null);
          }
        }

        if (hitterError) {
          console.error("通算打者成績の取得に失敗しました:", hitterError);
        } else if (Array.isArray(hitterStats) && hitterStats.length > 0) {
          setCareerHitterStats(hitterStats as CareerHitterRow[]);
        }

        if (pitcherError) {
          console.error("通算投手成績の取得に失敗しました:", pitcherError);
        }
        const fromDb = Array.isArray(pitcherStats) && pitcherStats.length > 0
          ? (pitcherStats as CareerPitcherRow[])
          : [];
        const dbYears = new Set(fromDb.map((r) => r.year));
        const gameRows = Array.isArray(careerGamePitcherData)
          ? (careerGamePitcherData as GamePitcherRowForAgg[])
          : [];
        const fromGames = aggregateGamePitcherStatsByYear(gameRows);
        const missingYears = fromGames.filter((r) => r.year != null && !dbYears.has(r.year));
        const merged =
          missingYears.length > 0
            ? [...fromDb, ...missingYears].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
            : fromDb;
        if (merged.length > 0) {
          setCareerPitcherStats(merged);
          setHasCareerPitcherStats(true);
        } else if (fromDb.length > 0) {
          setCareerPitcherStats(fromDb);
          setHasCareerPitcherStats(true);
        }

        const placeByUrl = new Map<string, string | null>();
        if (!gameInfoError && Array.isArray(gameInfoData)) {
          for (const row of gameInfoData as { url: string | null; place: string | null }[]) {
            placeByUrl.set(row.url ?? "", row.place ?? null);
          }
        }

        if (recentGamesError) {
          console.error("直近3試合の打者成績の取得に失敗しました:", recentGamesError);
        } else if (Array.isArray(recentGamesData)) {
          const hitterRows = recentGamesData as (RecentGameHitterRow & {
            date: string | null;
            start_time: string | null;
            url: string | null;
          })[];
          setRecentGamesHitterStats(hitterRows);

          const withPlace: RecentGameHitterRowWithPlace[] = hitterRows.map((row) => ({
            date: row.date,
            order: row.order,
            position: row.position,
            plate_apperance: row.plate_apperance,
            at_bat: row.at_bat,
            hit: row.hit,
            hr: row.hr,
            rbi: row.rbi,
            stolen_base: row.stolen_base,
            at_bat_in_scoring: row.at_bat_in_scoring,
            hit_in_scoring: row.hit_in_scoring,
            place: placeByUrl.get(row.url ?? "") ?? null,
          }));
          setRecentGamesHitterStatsWithPlace(withPlace);
        }

        if (recentGamesPitcherError) {
          console.error("直近3試合の投手成績の取得に失敗しました:", recentGamesPitcherError);
        } else if (Array.isArray(recentGamesPitcherData)) {
          const pitcherRows = recentGamesPitcherData as (RecentGamePitcherRow & {
            date: string | null;
            start_time: string | null;
            url: string | null;
          })[];
          setRecentGamesPitcherStats(pitcherRows);
          const withPlace: RecentGamePitcherRowWithPlace[] = pitcherRows.map((row) => ({
            date: row.date,
            order: row.order,
            result: row.result,
            inning: row.inning,
            runs_allowed: row.runs_allowed,
            earned_runs: row.earned_runs,
            hits_allowed: row.hits_allowed,
            strikeouts: row.strikeouts,
            walks_allowed: row.walks_allowed,
            hit_batsmen: row.hit_batsmen,
            place: placeByUrl.get(row.url ?? "") ?? null,
          }));
          setRecentGamesPitcherStatsWithPlace(withPlace);
        }

        const careerPlaceByUrl = new Map<string, string | null>();
        if (!careerGameInfoError && Array.isArray(careerGameInfoData)) {
          for (const row of careerGameInfoData as { url: string | null; place: string | null }[]) {
            careerPlaceByUrl.set(row.url ?? "", row.place ?? null);
          }
        }

        if (careerGameHitterError) {
          console.error("通算試合別打者成績の取得に失敗しました:", careerGameHitterError);
        } else if (Array.isArray(careerGameHitterData)) {
          const careerHitterRows = careerGameHitterData as (RecentGameHitterRow & {
            date: string | null;
            start_time: string | null;
            url: string | null;
          })[];
          setCareerGamesHitterStats(careerHitterRows);
          const careerWithPlace: RecentGameHitterRowWithPlace[] = careerHitterRows.map((row) => ({
            date: row.date,
            order: row.order,
            position: row.position,
            plate_apperance: row.plate_apperance,
            at_bat: row.at_bat,
            hit: row.hit,
            hr: row.hr,
            rbi: row.rbi,
            stolen_base: row.stolen_base,
            at_bat_in_scoring: row.at_bat_in_scoring,
            hit_in_scoring: row.hit_in_scoring,
            place: careerPlaceByUrl.get(row.url ?? "") ?? null,
          }));
          setCareerGamesHitterStatsWithPlace(careerWithPlace);
        }

        if (careerGamePitcherError) {
          console.error("通算試合別投手成績の取得に失敗しました:", careerGamePitcherError);
        } else if (Array.isArray(careerGamePitcherData)) {
          const careerPitcherRows = careerGamePitcherData as (RecentGamePitcherRow & {
            date: string | null;
            start_time: string | null;
            url: string | null;
          })[];
          setCareerGamesPitcherStats(careerPitcherRows);
          const careerPitcherWithPlace: RecentGamePitcherRowWithPlace[] = careerPitcherRows.map((row) => ({
            date: row.date,
            order: row.order,
            result: row.result,
            inning: row.inning,
            runs_allowed: row.runs_allowed,
            earned_runs: row.earned_runs,
            hits_allowed: row.hits_allowed,
            strikeouts: row.strikeouts,
            walks_allowed: row.walks_allowed,
            hit_batsmen: row.hit_batsmen,
            place: careerPlaceByUrl.get(row.url ?? "") ?? null,
          }));
          setCareerGamesPitcherStatsWithPlace(careerPitcherWithPlace);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();
  }, [team, playerNumber]);

  // マウント時に古いパンくずをクリアし、「選手詳細」の一瞬表示を防ぐ
  useEffect(() => {
    clearBreadcrumb();
  }, [clearBreadcrumb]);

  useEffect(() => {
    if (player && team) {
      const nameLabel = `${player.player_number ?? ""} ${player.player_name ?? ""}`.trim();
      setBreadcrumbSegments([
        { label: "チーム一覧", href: "/team" },
        { label: "チーム成績", href: `/team/${team}/stats` },
        { label: "選手一覧", href: `/team/${team}/player` },
        { label: nameLabel },
      ]);
    }
    return () => clearBreadcrumb();
  }, [player, team, setBreadcrumbSegments, clearBreadcrumb]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-base text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-none shadow-none">
          <CardHeader>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="space-y-6">
        <Card className="border-none shadow-none">
          <CardHeader>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">選手が見つかりませんでした</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 flex items-center gap-2">
          <p className="text-3xl font-bold min-w-10">
            {player.player_number != null ? `${player.player_number}` : "—"}
          </p>
          <p className="text-2xl font-bold">
            {player.player_name || "—"}
          </p>
        </CardHeader>
        <CardContent className="px-0 space-y-8">
          <PlayerStatsTabs
            currentYearHitterStats={currentYearHitterStats}
            currentYearPitcherStats={currentYearPitcherStats}
            hasCurrentYearPitcherStats={hasCurrentYearPitcherStats}
            careerHitterStats={careerHitterStats}
            careerPitcherStats={careerPitcherStats}
            hasCareerPitcherStats={hasCareerPitcherStats}
            recentGamesHitterStats={recentGamesHitterStats}
            recentGamesHitterStatsWithPlace={recentGamesHitterStatsWithPlace}
            recentGamesPitcherStats={recentGamesPitcherStats}
            recentGamesPitcherStatsWithPlace={recentGamesPitcherStatsWithPlace}
            careerGamesHitterStats={careerGamesHitterStats}
            careerGamesHitterStatsWithPlace={careerGamesHitterStatsWithPlace}
            careerGamesPitcherStats={careerGamesPitcherStats}
            careerGamesPitcherStatsWithPlace={careerGamesPitcherStatsWithPlace}
          />
        </CardContent>
      </Card>
    </div>
  );
}
