"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatsTabs } from "@/components/PlayerStatsTabs";
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

type Props = { params: Promise<{ team: string; player_number: string }> };

export default function PlayerDetailPage({ params }: Props) {
  const router = useRouter();
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
        } else if (Array.isArray(pitcherStats) && pitcherStats.length > 0) {
          setCareerPitcherStats(pitcherStats as CareerPitcherRow[]);
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

  const handleBack = () => {
    // document.referrerをチェック（遷移元のURL）
    // 同じオリジン内で遷移してきた場合は戻る、それ以外は/playerに遷移
    if (typeof window !== "undefined" && document.referrer) {
      const referrerUrl = new URL(document.referrer);
      const currentUrl = new URL(window.location.href);
      
      // 同じオリジン内で遷移してきた場合は戻る
      if (referrerUrl.origin === currentUrl.origin) {
        router.back();
        return;
      }
    }
    
    // 遷移前のページがない場合は/playerに遷移
    router.push("/player");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
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
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
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
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
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
      <div className="flex items-center gap-2 mb-0">
        <Button onClick={handleBack} variant="outline" size="sm">
          戻る
        </Button>
      </div>
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
