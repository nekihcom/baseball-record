"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useMemo } from "react";
import type {
  Team,
  TeamStats,
  HitterStats,
  PitcherStats,
  Game,
  GameHitterStats,
  GamePitcherStats,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamStatsTabs } from "@/components/TeamStatsTabs";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

type Props = { params: Promise<{ team: string }> };

export default function TeamStatsPage({ params }: Props) {
  const { setBreadcrumbLabel, clearBreadcrumb } = useBreadcrumb();
  const [teamKey, setTeamKey] = useState<string>("");
  const [teamInfo, setTeamInfo] = useState<Team | null>(null);
  const [currentYearTeamStats, setCurrentYearTeamStats] = useState<TeamStats | null>(null);
  const [careerTeamStats, setCareerTeamStats] = useState<TeamStats[] | null>(null);
  const [currentYearHitterStats, setCurrentYearHitterStats] = useState<HitterStats[] | null>(null);
  const [careerHitterStats, setCareerHitterStats] = useState<HitterStats[] | null>(null);
  const [currentYearPitcherStats, setCurrentYearPitcherStats] = useState<PitcherStats[] | null>(null);
  const [careerPitcherStats, setCareerPitcherStats] = useState<PitcherStats[] | null>(null);
  const [last3Games, setLast3Games] = useState<Game[] | null>(null);
  const [currentYearGames, setCurrentYearGames] = useState<Game[] | null>(null);
  const [currentYearGameHitterStats, setCurrentYearGameHitterStats] = useState<
    GameHitterStats[] | null
  >(null);
  const [currentYearGamePitcherStats, setCurrentYearGamePitcherStats] = useState<
    GamePitcherStats[] | null
  >(null);
  const [teamKeyToName, setTeamKeyToName] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setTeamKey(resolvedParams.team);
    });
  }, [params]);

  useEffect(() => {
    if (!teamKey) return;

    async function fetchTeam() {
      try {
        setLoading(true);
        setError(null);
        setCurrentYearTeamStats(null);
        setCareerTeamStats(null);
        setCurrentYearHitterStats(null);
        setCareerHitterStats(null);
        setCurrentYearPitcherStats(null);
        setCareerPitcherStats(null);
        setLast3Games(null);
        setCurrentYearGames(null);
        setCurrentYearGameHitterStats(null);
        setCurrentYearGamePitcherStats(null);

        const currentYear = new Date().getFullYear();

        const [
          { data: teamData, error: teamError },
          { data: currentYearData, error: currentYearError },
          { data: careerData, error: careerError },
          { data: currentYearHitterData, error: currentYearHitterError },
          { data: careerHitterData, error: careerHitterError },
          { data: currentYearPitcherData, error: currentYearPitcherError },
          { data: careerPitcherData, error: careerPitcherError },
          { data: last3GamesData, error: last3GamesError },
          { data: currentYearGamesData, error: currentYearGamesError },
          { data: gameHitterData, error: gameHitterError },
          { data: gamePitcherData, error: gamePitcherError },
          { data: teamsData, error: teamsError },
        ] = await Promise.all([
          supabase
            .from("master_teams_info")
            .select("*")
            .eq("key", teamKey)
            .eq("delete_flg", 0)
            .single(),
          supabase
            .from("transaction_team_stats")
            .select("*")
            .eq("team", teamKey)
            .eq("year", currentYear)
            .eq("delete_flg", 0)
            .maybeSingle(),
          supabase
            .from("transaction_team_stats")
            .select("*")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .order("year", { ascending: false }),
          supabase
            .from("transaction_hitter_stats")
            .select("*")
            .eq("team", teamKey)
            .eq("year", currentYear)
            .eq("delete_flg", 0)
            .order("player_number", { ascending: true }),
          supabase
            .from("transaction_hitter_stats")
            .select("*")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .order("year", { ascending: false })
            .order("player_number", { ascending: true }),
          supabase
            .from("transaction_pitcher_stats")
            .select("*")
            .eq("team", teamKey)
            .eq("year", currentYear)
            .eq("delete_flg", 0)
            .order("player_number", { ascending: true }),
          supabase
            .from("transaction_pitcher_stats")
            .select("*")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .order("year", { ascending: false })
            .order("player_number", { ascending: true }),
          supabase
            .from("transaction_game_info")
            .select("*")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .gte("date", `${currentYear}0101`)
            .lte("date", `${currentYear}1231`)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false })
            .limit(3),
          supabase
            .from("transaction_game_info")
            .select("*")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .gte("date", `${currentYear}0101`)
            .lte("date", `${currentYear}1231`)
            .order("date", { ascending: true }),
          supabase
            .from("transaction_game_hitter_stats")
            .select("date, at_bat, hit")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .gte("date", `${currentYear}0101`)
            .lte("date", `${currentYear}1231`),
          supabase
            .from("transaction_game_pitcher_stats")
            .select("date, inning, earned_runs")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .gte("date", `${currentYear}0101`)
            .lte("date", `${currentYear}1231`),
          supabase
            .from("master_teams_info")
            .select("key, team_name")
            .eq("delete_flg", 0),
        ]);

        if (teamError) {
          setError(teamError.message);
          setTeamInfo(null);
          return;
        }

        setTeamInfo(teamData as Team);

        if (!currentYearError && currentYearData) {
          setCurrentYearTeamStats(currentYearData as TeamStats);
        }
        if (!careerError && Array.isArray(careerData) && careerData.length > 0) {
          setCareerTeamStats(careerData as TeamStats[]);
        }
        if (!currentYearHitterError && Array.isArray(currentYearHitterData)) {
          setCurrentYearHitterStats(currentYearHitterData as HitterStats[]);
        }
        if (!careerHitterError && Array.isArray(careerHitterData)) {
          setCareerHitterStats(careerHitterData as HitterStats[]);
        }
        if (!currentYearPitcherError && Array.isArray(currentYearPitcherData)) {
          setCurrentYearPitcherStats(currentYearPitcherData as PitcherStats[]);
        }
        if (!careerPitcherError && Array.isArray(careerPitcherData)) {
          setCareerPitcherStats(careerPitcherData as PitcherStats[]);
        }
        if (!last3GamesError && Array.isArray(last3GamesData)) {
          setLast3Games(last3GamesData as Game[]);
        }
        if (!currentYearGamesError && Array.isArray(currentYearGamesData)) {
          setCurrentYearGames(currentYearGamesData as Game[]);
        }
        if (!gameHitterError && Array.isArray(gameHitterData)) {
          setCurrentYearGameHitterStats(gameHitterData as GameHitterStats[]);
        }
        if (!gamePitcherError && Array.isArray(gamePitcherData)) {
          setCurrentYearGamePitcherStats(gamePitcherData as GamePitcherStats[]);
        }
        if (!teamsError && Array.isArray(teamsData)) {
          const map: Record<string, string> = {};
          for (const t of teamsData as { key: string; team_name: string | null }[]) {
            if (t.key != null && t.team_name != null) map[t.key] = t.team_name;
          }
          setTeamKeyToName(map);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
        setTeamInfo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [teamKey]);

  useEffect(() => {
    clearBreadcrumb();
  }, [clearBreadcrumb]);

  useEffect(() => {
    if (teamInfo) {
      const teamName = teamInfo.team_name ?? teamInfo.team ?? teamKey ?? "—";
      // パンくず: TOP > チーム名
      setBreadcrumbLabel(teamName);
    }
    return () => clearBreadcrumb();
  }, [teamInfo, teamKey, setBreadcrumbLabel, clearBreadcrumb]);

  const monthlyStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const games = currentYearGames ?? [];
    const hitterStats = currentYearGameHitterStats ?? [];
    const pitcherStats = currentYearGamePitcherStats ?? [];

    const parseInningToDecimal = (inning: string | null): number => {
      if (!inning || typeof inning !== "string") return 0;
      const parts = inning.split("回");
      const full = parseInt(parts[0] ?? "0", 10) || 0;
      const frac = (parts[1] ?? "").trim();
      if (frac === "1/3") return full + 1 / 3;
      if (frac === "2/3") return full + 2 / 3;
      return full;
    };

    const rows: {
      month: number;
      games: number;
      wins: number;
      losses: number;
      draws: number;
      winning_pct: number | null;
      batting_avg: number | null;
      era: number | null;
    }[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, "0");
      const prefix = `${currentYear}${monthStr}`;
      const monthGames = games.filter(
        (g) => g.date && g.date.length >= 6 && g.date.slice(0, 6) === prefix
      );
      const wins = monthGames.filter((g) => g.result === "勝ち").length;
      const losses = monthGames.filter((g) => g.result === "負け").length;
      const draws = monthGames.filter((g) => g.result === "分").length;
      const gamesCount = monthGames.length;
      const winning_pct =
        gamesCount > 0 && wins + losses > 0 ? wins / (wins + losses) : null;

      const monthHitter = hitterStats.filter(
        (h) => h.date && h.date.length >= 6 && h.date.slice(0, 6) === prefix
      );
      const totalAtBat = monthHitter.reduce(
        (s, h) => s + (typeof h.at_bat === "number" ? h.at_bat : parseInt(String(h.at_bat ?? 0), 10) || 0),
        0
      );
      const totalHit = monthHitter.reduce(
        (s, h) => s + (typeof h.hit === "number" ? h.hit : parseInt(String(h.hit ?? 0), 10) || 0),
        0
      );
      const batting_avg = totalAtBat > 0 ? totalHit / totalAtBat : null;

      const monthPitcher = pitcherStats.filter(
        (p) => p.date && p.date.length >= 6 && p.date.slice(0, 6) === prefix
      );
      let totalInnings = 0;
      let totalEarnedRuns = 0;
      for (const p of monthPitcher) {
        totalInnings += parseInningToDecimal(p.inning);
        totalEarnedRuns += typeof p.earned_runs === "number" ? p.earned_runs : parseInt(String(p.earned_runs ?? 0), 10) || 0;
      }
      const era = totalInnings > 0 ? (totalEarnedRuns * 9) / totalInnings : null;

      rows.push({
        month: m,
        games: gamesCount,
        wins,
        losses,
        draws,
        winning_pct,
        batting_avg,
        era,
      });
    }
    return rows;
  }, [currentYearGames, currentYearGameHitterStats, currentYearGamePitcherStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-base text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader />
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!teamInfo) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader />
        <CardContent>
          <p className="text-muted-foreground">チームが見つかりませんでした</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl flex flex-wrap items-baseline gap-0">
            <span>{teamInfo.team_name ?? teamInfo.team ?? teamKey ?? "—"}</span>
            <Link
              href={`/team/${teamKey}/player`}
              className="text-sm text-muted-foreground hover:opacity-80 ml-4"
            >
              選手一覧
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-8">
          <TeamStatsTabs
            currentYearTeamStats={currentYearTeamStats}
            careerTeamStats={careerTeamStats}
            currentYearHitterStats={currentYearHitterStats}
            careerHitterStats={careerHitterStats}
            currentYearPitcherStats={currentYearPitcherStats}
            careerPitcherStats={careerPitcherStats}
            last3Games={last3Games}
            teamKey={teamKey}
            teamKeyToName={teamKeyToName}
            monthlyStats={monthlyStats}
          />
        </CardContent>
      </Card>
    </div>
  );
}
