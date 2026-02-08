"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Game, GameHitterStats, GamePitcherStats } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getDisplayTeamName } from "@/lib/utils";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

type Props = { params: Promise<{ id: string }> };

function formatGameDateForBreadcrumb(dateStr: string | null): string {
  if (!dateStr || dateStr.length !== 8) return "";
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(4, 6), 10) - 1;
  const d = parseInt(dateStr.slice(6, 8), 10);
  const date = new Date(y, m, d);
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${weekDays[date.getDay()]})`;
}

export default function GameDetailPage({ params }: Props) {
  const router = useRouter();
  const { setBreadcrumbSegments, clearBreadcrumb } = useBreadcrumb();
  const [id, setId] = useState<string>("");
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hitterStats, setHitterStats] = useState<GameHitterStats[]>([]);
  const [pitcherStats, setPitcherStats] = useState<GamePitcherStats[]>([]);
  const [statsType, setStatsType] = useState<"hitter" | "pitcher">("hitter");
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;

    async function fetchGame() {
      try {
        setLoading(true);
        setError(null);

        // IDをパース: date_team_top_or_bottom
        const parts = id.split("_");
        if (parts.length !== 3) {
          setError("無効な試合IDです");
          setLoading(false);
          return;
        }

        const [date, team, topOrBottom] = parts;

        const { data, error: fetchError } = await supabase
          .from("transaction_game_info")
          .select("*")
          .eq("date", date)
          .eq("team", team)
          .eq("top_or_bottom", topOrBottom)
          .eq("delete_flg", 0)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setGame(data as Game);
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [id]);

  // マウント時に古いパンくずをクリアし、「試合詳細」の一瞬表示を防ぐ
  useEffect(() => {
    clearBreadcrumb();
  }, [clearBreadcrumb]);

  // 打者成績と投手成績を取得
  useEffect(() => {
    if (!game || !game.date || !game.team || !game.start_time) return;

    const gameDate = game.date;
    const gameTeam = game.team;
    const gameStartTime = game.start_time;

    async function fetchStats() {
      try {
        setStatsLoading(true);

        const [hitterRes, pitcherRes] = await Promise.all([
          supabase
            .from("transaction_game_hitter_stats")
            .select("*")
            .eq("date", gameDate)
            .eq("team", gameTeam)
            .eq("start_time", gameStartTime)
            .eq("delete_flg", 0)
            .order("order", { ascending: true }),
          supabase
            .from("transaction_game_pitcher_stats")
            .select("*")
            .eq("date", gameDate)
            .eq("team", gameTeam)
            .eq("start_time", gameStartTime)
            .eq("delete_flg", 0)
            .order("order", { ascending: true }),
        ]);

        if (hitterRes.data) {
          setHitterStats(hitterRes.data as GameHitterStats[]);
        }
        if (pitcherRes.data) {
          setPitcherStats(pitcherRes.data as GamePitcherStats[]);
        }
      } catch (e) {
        console.error("成績データの取得に失敗しました:", e);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [game]);

  useEffect(() => {
    if (game?.date != null) {
      const teamDateLabel = `${getDisplayTeamName(game.top_team, null)} VS ${getDisplayTeamName(game.bottom_team, null)} ${formatGameDateForBreadcrumb(game.date)}`;
      setBreadcrumbSegments([
        { label: "試合結果", href: "/game" },
        { label: teamDateLabel },
      ]);
    }
    return () => clearBreadcrumb();
  }, [game, setBreadcrumbSegments, clearBreadcrumb]);

  const handleBack = () => {
    // document.referrerをチェック（遷移元のURL）
    // 同じオリジン内で遷移してきた場合は戻る、それ以外は/gameに遷移
    if (typeof window !== "undefined" && document.referrer) {
      const referrerUrl = new URL(document.referrer);
      const currentUrl = new URL(window.location.href);
      
      // 同じオリジン内で遷移してきた場合は戻る
      if (referrerUrl.origin === currentUrl.origin) {
        router.back();
        return;
      }
    }
    
    // 遷移前のページがない場合は/gameに遷移
    router.push("/game");
  };

  // 各回の得点を配列に変換（1-7イニングのみ）
  const getInningScores = (game: Game, isTop: boolean): (number | null)[] => {
    const scores: (number | null)[] = [];
    for (let i = 1; i <= 7; i++) {
      const key = isTop 
        ? `top_inning_score_${i}` as keyof Game
        : `bottom_inning_score_${i}` as keyof Game;
      scores.push(game[key] as number | null);
    }
    return scores;
  };

  // 投手名から括弧内の部分を削除（例：「中森 (1勝)」→「中森」）
  const cleanPitcherName = (name: string | null): string => {
    if (!name) return "";
    // 括弧とその中身を削除
    return name.replace(/\s*\([^)]*\)/g, "").trim();
  };

  // 日付文字列（yyyymmdd）からDateオブジェクトを作成
  const parseDate = (dateStr: string | null): Date | null => {
    if (!dateStr || dateStr.length !== 8) return null;
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    return new Date(year, month, day);
  };

  // 曜日を取得
  const getDayOfWeek = (date: Date): string => {
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekDays[date.getDay()];
  };

  // 日付をフォーマット（例：2025年3月28日(金)）
  const formatGameDate = (dateStr: string | null): string => {
    if (!dateStr || dateStr.length !== 8) return "";
    const date = parseDate(dateStr);
    if (!date) return "";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = getDayOfWeek(date);
    return `${year}年${month}月${day}日(${dayOfWeek})`;
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

  if (error || !game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "試合データが見つかりませんでした"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topInningScores = getInningScores(game, true);
  const bottomInningScores = getInningScores(game, false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={handleBack} variant="outline" size="sm">
          戻る
        </Button>
      </div>
      
      {/* 試合概要 */}
      <div className="text-[#333333] px-0 py-3 rounded">
        <div className="flex items-center justify-between">
          <div className="flex-1 @text-center">
            <div className="text-3xl font-bold mb-1">
              {getDisplayTeamName(game.top_team, null)} VS {getDisplayTeamName(game.bottom_team, null)}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">{formatGameDate(game.date)} {game.start_time || ""}</p>
              <p className="text-sm text-gray-500">{game.place || ""}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Card className="border-none shadow-none py-0">
        <CardContent className="px-0">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max text-sm border-collapse">
              <thead className="bg-[#333333] text-white">
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-[#333333] px-2 py-1 text-left font-semibold whitespace-nowrap">
                    チーム
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7].map((inning) => (
                    <th
                      key={inning}
                      className="px-2 py-1 text-center font-semibold whitespace-nowrap min-w-[40px]"
                    >
                      {inning}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center font-semibold whitespace-nowrap">計</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="sticky left-0 z-10 bg-background px-2 py-1 font-medium whitespace-nowrap">
                    {getDisplayTeamName(game.top_team, null)}
                  </td>
                  {topInningScores.map((score, index) => (
                    <td key={index} className="px-2 py-1 text-center whitespace-nowrap">
                      {score !== null ? score : ""}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center font-medium whitespace-nowrap">
                    {game.top_team_score !== null ? game.top_team_score : "—"}
                  </td>
                </tr>
                <tr className="border-b last:border-b-0">
                  <td className="sticky left-0 z-10 bg-background px-2 py-1 font-medium whitespace-nowrap">
                    {getDisplayTeamName(game.bottom_team, null)}
                  </td>
                  {bottomInningScores.map((score, index) => (
                    <td key={index} className="px-2 py-1 text-center whitespace-nowrap">
                      {score !== null ? score : ""}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center font-medium whitespace-nowrap">
                    {game.bottom_team_score !== null ? game.bottom_team_score : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
                    
          {/* 責任投手欄 */}
          <div className="my-12">
            <div className="text-center@ text-2xl font-bold mb-1">
              <p>責任投手</p>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center w-16 text-white font-bold" style={{ backgroundColor: '#333333' }}>勝</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cleanPitcherName(game.win_pitcher) || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center w-16 text-white font-bold" style={{ backgroundColor: '#333333' }}>負</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cleanPitcherName(game.lose_pitcher) || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center w-16 text-white font-bold" style={{ backgroundColor: '#333333' }}>S</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {/* セーブ投手のデータは現在利用不可 */}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center w-16 text-white font-bold" style={{ backgroundColor: '#333333' }}>HR</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {game.hr_player || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 打者成績・投手成績 */}
      <Card className="border-none shadow-none py-0">
        <CardContent className="px-0">
          <Tabs value={statsType} onValueChange={(v) => setStatsType(v as "hitter" | "pitcher")} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="hitter" className="flex-1">
                打者成績
              </TabsTrigger>
              <TabsTrigger value="pitcher" className="flex-1">
                投手成績
              </TabsTrigger>
            </TabsList>

          {statsLoading ? (
            <div className="flex items-center justify-center min-h-[200px] mt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">読み込み中...</p>
              </div>
            </div>
          ) : statsType === "hitter" ? (
            <TabsContent value="hitter" className="mt-4">
            <div className="w-full overflow-x-auto">
              <table className="min-w-max text-sm border-collapse">
                <thead className="bg-[#333333] text-white">
                  <tr className="border-b">
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap align-middle" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>守備</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap align-middle min-w-[80px]" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>
                      <span>選手名</span>
                    </th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>打席</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>打数</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>安打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>本塁打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>打点</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>得点</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>盗塁</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>二塁打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>三塁打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>得点圏打数</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>得点圏安打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>三振</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>四球</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>死球</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>犠打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>犠飛</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>併殺打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>敵失</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>失策</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>盗塁阻止</th>
                  </tr>
                </thead>
                <tbody>
                  {hitterStats.length === 0 ? (
                    <tr className="border-b last:border-b-0">
                      <td colSpan={21} className="px-2 py-1 text-center text-muted-foreground">
                        打者成績データがありません
                      </td>
                    </tr>
                  ) : (
                    hitterStats.map((stat) => (
                      <tr key={stat.key} className="border-b last:border-b-0">
                        <td className="px-2 py-1 text-center whitespace-nowrap align-middle">{stat.position || "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap align-middle min-w-[80px]">{stat.player || "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.plate_apperance ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.at_bat ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hit ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hr ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.rbi ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.run ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.stolen_base ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.double ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.triple ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.at_bat_in_scoring ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hit_in_scoring ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.strikeout ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.walk ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hit_by_pitch ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.sacrifice_bunt ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.sacrifice_fly ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.double_play ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.oponent_error ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.own_error ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.caught_stealing ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </TabsContent>
          ) : (
            <TabsContent value="pitcher" className="mt-4">
            <div className="w-full overflow-x-auto">
              <table className="min-w-max text-sm border-collapse">
                <thead className="bg-[#333333] text-white">
                  <tr className="border-b">
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap align-middle w-10" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>結果</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap align-middle min-w-[100px]" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>選手名</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>投球回</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>球数</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>失点</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>自責点</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>被安打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>被本塁打</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>奪三振</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>与四球</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>与死球</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>ボーク</th>
                    <th className="px-2 py-1 text-center font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '0.1em' }}>暴投</th>
                  </tr>
                </thead>
                <tbody>
                  {pitcherStats.length === 0 ? (
                    <tr className="border-b last:border-b-0">
                      <td colSpan={13} className="px-2 py-1 text-center text-muted-foreground">
                        投手成績データがありません
                      </td>
                    </tr>
                  ) : (
                    pitcherStats.map((stat) => (
                      <tr key={stat.key} className="border-b last:border-b-0">
                        <td className="px-2 py-1 text-center whitespace-nowrap align-middle w-10">{stat.result == "-" ? "" : stat.result}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap align-middle min-w-[100px]">{stat.player || "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap min-w-[100px]">{stat.inning || "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.pitches ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.runs_allowed ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.earned_runs ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hits_allowed ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hr_allowed ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.strikeouts ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.walks_allowed ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.hit_batsmen ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.balks ?? "—"}</td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">{stat.wild_pitches ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </TabsContent>
          )}
        </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
