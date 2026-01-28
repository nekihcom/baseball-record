"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Game, Team } from "@/lib/types";
import { getDisplayTeamName as getDisplayTeamNameUtil } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(d: string | null) {
  if (!d) return "—";
  if (d.length === 8) {
    return `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6, 8)}`;
  }
  return d;
}

/** 日付文字列（yyyymmdd）からDateオブジェクトを作成 */
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));
  return new Date(year, month, day);
}

/** 日付をyyyymmdd形式に変換 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/** 日付をM/d形式に変換 */
function formatDateToMD(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

/** 曜日を取得（月曜日始まり） */
function getDayOfWeek(date: Date): string {
  const weekDays = ["月", "火", "水", "木", "金", "土", "日"];
  // 月曜日始まりに変換（日=0 → 6, 月=1 → 0, 火=2 → 1, ...）
  const dayIndex = (date.getDay() + 6) % 7;
  return weekDays[dayIndex];
}

/** 当該行の team と master_teams_info.key を突合し、team_name を返す */
function getTeamNameByKey(
  keyMap: Map<string, string>,
  teamKey: string | null
): string | null {
  if (!teamKey) return null;
  return keyMap.get(teamKey) ?? null;
}

/** 試合詳細ページのパスを生成。yyyymmdd_team_top_or_bottom。不足時は null */
function getGameDetailHref(game: Game): string | null {
  const { date, team, top_or_bottom } = game;
  if (!date || date.length !== 8 || !team || !top_or_bottom) return null;
  return `/game/${date}_${team}_${top_or_bottom}`;
}

/** チーム名から表示用の名前を抽出（括弧内があれば括弧内を優先） */
function getDisplayTeamName(teamName: string | null, teamKey: string | null): string {
  return getDisplayTeamNameUtil(teamName, teamKey);
}

/** 結果を判定する */
function getResultType(result: string | null): "win" | "loss" | "draw" | "unknown" {
  if (!result) return "unknown";
  
  const resultLower = result.toLowerCase();
  if (resultLower.includes("勝") || resultLower.includes("win")) {
    return "win";
  } else if (resultLower.includes("負") || resultLower.includes("loss") || resultLower.includes("lose")) {
    return "loss";
  } else if (resultLower.includes("分") || resultLower.includes("draw") || resultLower.includes("tie")) {
    return "draw";
  }
  return "unknown";
}

/** 結果に応じた背景色とテキスト色のクラスを返す */
function getResultStyle(result: string | null): string {
  const resultType = getResultType(result);
  switch (resultType) {
    case "win":
      return "bg-red-700 text-white";
    case "loss":
      return "bg-blue-700 text-white";
    case "draw":
      return "bg-gray-700 text-white";
    default:
      return "bg-gray-700 text-white";
  }
}

/** 結果に応じたアイコンを返す */
function getResultIcon(result: string | null) {
  const resultType = getResultType(result);
  
  switch (resultType) {
    case "win":
      return (
        <p>◯</p>
      );
    case "loss":
      return (
        <p>●</p>
      );
    case "draw":
      return (
        <p>△</p>
      );
    default:
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
  }
}

export function GameList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [teamKeyToName, setTeamKeyToName] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 現在の日付を初期値として設定
  const now = new Date();
  
  // URLパラメータから初期値を読み込む
  const getInitialYear = () => {
    const yearParam = searchParams.get("year");
    if (yearParam) {
      const year = parseInt(yearParam, 10);
      if (!isNaN(year) && year > 2000 && year < 2100) return year;
    }
    return now.getFullYear();
  };
  
  const getInitialTeam = () => {
    const teamParam = searchParams.get("team");
    return teamParam || null;
  };
  
  const [selectedYear, setSelectedYear] = useState(getInitialYear);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(getInitialTeam);
  
  // URLパラメータを更新する関数（メモ化）
  const updateURLParams = useCallback((year: number, team: string | null) => {
    const params = new URLSearchParams();
    if (year !== now.getFullYear()) {
      params.set("year", year.toString());
    }
    if (team) {
      params.set("team", team);
    }
    const queryString = params.toString();
    const newURL = queryString ? `/game?${queryString}` : "/game";
    router.replace(newURL);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setError(null);

        const [gamesRes, teamsRes] = await Promise.all([
          supabase
            .from("transaction_game_info")
            .select("*")
            .eq("delete_flg", 0)
            .order("date", { ascending: false })
            .order("start_time", { ascending: false }),
          supabase
            .from("master_teams_info")
            .select("key, team_name")
            .eq("delete_flg", 0),
        ]);

        if (cancelled) return;
        if (gamesRes.error) {
          setError(gamesRes.error.message);
          setGames([]);
          return;
        }
        setGames((gamesRes.data ?? []) as Game[]);

        const map = new Map<string, string>();
        if (!teamsRes.error && teamsRes.data) {
          for (const t of teamsRes.data as Pick<Team, "key" | "team_name">[]) {
            if (t.key != null && t.team_name != null) {
              map.set(t.key, t.team_name);
            }
          }
        }
        setTeamKeyToName(map);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
        setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // チームリストを取得（プルダウン用）
  const teamList = useMemo(() => {
    const teams: Array<{ key: string; name: string }> = [];
    teamKeyToName.forEach((name, key) => {
      teams.push({ key, name });
    });
    // チーム名でソート
    return teams.sort((a, b) => {
      const nameA = getDisplayTeamName(a.name, a.key);
      const nameB = getDisplayTeamName(b.name, b.key);
      return nameA.localeCompare(nameB, "ja");
    });
  }, [teamKeyToName]);

  // 選択した年とチームで試合データをフィルタリング
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // 年でフィルタリング
      if (!game.date || game.date.length !== 8) return false;
      const gameYear = parseInt(game.date.slice(0, 4));
      if (gameYear !== selectedYear) return false;
      
      // チームでフィルタリング
      if (selectedTeam) {
        return game.team === selectedTeam;
      }
      
      return true;
    });
  }, [games, selectedYear, selectedTeam]);

  // 日付ごとに試合をグループ化（日付順にソート）
  const gamesByDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    filteredGames.forEach((game) => {
      if (game.date) {
        const dateKey = game.date;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(game);
      }
    });
    return map;
  }, [filteredGames]);

  // 試合のある日付をソートして取得（降順：新しい日付から）
  const sortedDates = useMemo(() => {
    return Array.from(gamesByDate.keys()).sort((a, b) => {
      // yyyymmdd形式なので文字列比較でソート可能
      return b.localeCompare(a);
    });
  }, [gamesByDate]);

  // 月ごとに試合をグループ化（PC表示用）
  const gamesByMonth = useMemo(() => {
    const map = new Map<string, Game[]>();
    filteredGames.forEach((game) => {
      if (game.date && game.date.length === 8) {
        const monthKey = game.date.slice(0, 6); // yyyymm形式
        if (!map.has(monthKey)) {
          map.set(monthKey, []);
        }
        map.get(monthKey)!.push(game);
      }
    });
    // 各月の試合を日付順（降順）でソート
    map.forEach((games, monthKey) => {
      games.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.localeCompare(a.date);
      });
    });
    return map;
  }, [filteredGames]);

  // 月のキーをソートして取得（降順：新しい月から）
  const sortedMonths = useMemo(() => {
    return Array.from(gamesByMonth.keys()).sort((a, b) => {
      return b.localeCompare(a);
    });
  }, [gamesByMonth]);

  // 年の選択肢を生成（実際のデータから年を抽出）
  const yearOptions = useMemo(() => {
    const yearSet = new Set<number>();
    
    // 試合データから年を抽出
    games.forEach((game) => {
      if (game.date && game.date.length === 8) {
        const year = parseInt(game.date.slice(0, 4));
        if (!isNaN(year)) {
          yearSet.add(year);
        }
      }
    });
    
    // ソートして配列に変換（降順）
    const years = Array.from(yearSet).sort((a, b) => b - a);
    return years;
  }, [games]);


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
      <Card>
        <CardHeader>
          <CardTitle>試合データ</CardTitle>
          <CardDescription>エラー</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Supabase の環境変数（NEXT_PUBLIC_SUPABASE_URL / ANON_KEY）や RLS 設定を確認してください。
          </p>
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>試合データ</CardTitle>
          <CardDescription>登録されている試合がありません</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            backend のスクレイピング・Supabase 投入後に試合が表示されます。
          </p>
        </CardContent>
      </Card>
    );
  }

  // 前年・翌年への移動関数
  const goToPreviousYear = () => {
    const newYear = selectedYear - 1;
    setSelectedYear(newYear);
    updateURLParams(newYear, selectedTeam);
  };

  const goToNextYear = () => {
    const newYear = selectedYear + 1;
    setSelectedYear(newYear);
    updateURLParams(newYear, selectedTeam);
  };

  // ナビゲーションコンポーネント
  const CalendarNavigation = () => (
    <div className="relative flex items-center py-4">
      {/* 中央：前年、年プルダウン、翌年 */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* 前年ボタン */}
        <button
          onClick={goToPreviousYear}
          className="flex items-center justify-center h-8 px-4 border border-foreground rounded bg-background hover:bg-accent transition-colors"
          aria-label="前年"
        >
          <span className="text-sm font-medium whitespace-nowrap">前年</span>
        </button>
        
        {/* 年のプルダウン */}
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => {
            const newYear = parseInt(value);
            setSelectedYear(newYear);
            updateURLParams(newYear, selectedTeam);
          }}
        >
          <SelectTrigger className="w-20 border-b-2 border-foreground rounded-none shadow-none border-t-0 border-l-0 border-r-0 bg-transparent px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}年
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* 翌年ボタン */}
        <button
          onClick={goToNextYear}
          className="flex items-center justify-center h-8 px-4 border border-foreground rounded bg-background hover:bg-accent transition-colors"
          aria-label="翌年"
        >
          <span className="text-sm font-medium whitespace-nowrap">翌年</span>
        </button>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-none py-0">
      <CardHeader className="px-0">
        {/* 検索条件 */}
        <div className="mb-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <label className="text-base font-medium whitespace-nowrap">チーム</label>
            <Select
              value={selectedTeam || "all"}
              onValueChange={(value) => {
                const newTeam = value === "all" ? null : value;
                setSelectedTeam(newTeam);
                updateURLParams(selectedYear, newTeam);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="すべてのチーム" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのチーム</SelectItem>
                {teamList.map((team) => (
                  <SelectItem key={team.key} value={team.key}>
                    {getDisplayTeamName(team.name, team.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CalendarNavigation />
      </CardHeader>
      <CardContent className="px-0">
        {/* 検索結果がない場合 */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-12 text-base text-muted-foreground">
            選択した年で試合が行われていません
          </div>
        ) : (
          <>
            {/* スマホ表示：日付ごとの縦並びレイアウト */}
            <div className="space-y-4 md:hidden">
              {sortedDates.map((dateKey, index) => {
                const dayGames = gamesByDate.get(dateKey) || [];
                if (dayGames.length === 0) return null;
                
                const date = parseDate(dateKey);
                if (!date) return null;
                
                const currentMonth = date.getMonth() + 1;
                const prevDateKey = index > 0 ? sortedDates[index - 1] : null;
                const prevDate = prevDateKey ? parseDate(prevDateKey) : null;
                const prevMonth = prevDate ? prevDate.getMonth() + 1 : null;
                
                // 月が変わった時に月のヘッダーを表示
                const showMonthHeader = prevMonth === null || prevMonth !== currentMonth;
                
                return (
                  <div key={dateKey}>
                    {/* 月のヘッダー */}
                    {showMonthHeader && (
                      <div className="w-full bg-[#333333] text-white text-lg font-bold mb-3 pt-2 pb-2 px-4 rounded">
                        {currentMonth}月
                      </div>
                    )}
                    
                    {/* 試合リスト */}
                    <div className="space-y-3">
                      {dayGames.map((game) => {
                        const ourTeamName = getTeamNameByKey(teamKeyToName, game.team);
                        const ourTeamKey = game.team;
                        const gameHref = getGameDetailHref(game);
                        
                        // 対戦相手を判定
                        const isTopTeam = ourTeamName && game.top_team === ourTeamName;
                        const opponentTeamRaw = isTopTeam ? game.bottom_team : game.top_team;
                        
                        // スコアを表示（自チーム - 相手チーム）
                        const ourScore = isTopTeam ? game.top_team_score : game.bottom_team_score;
                        const opponentScore = isTopTeam ? game.bottom_team_score : game.top_team_score;
                        
                        // チーム名を表示（括弧内があれば括弧内を優先）
                        const teamDisplayName = getDisplayTeamName(ourTeamName, ourTeamKey);
                        const opponentDisplayName = getDisplayTeamName(opponentTeamRaw, opponentTeamRaw);
                        
                        const gameDate = parseDate(game.date);
                        
                        const content = (
                          <>
                            {/* 上部：日と曜日 */}
                            <div className="text-base font-medium">
                              {gameDate ? `${gameDate.getDate()}(${getDayOfWeek(gameDate)})` : ""}
                            </div>
                            
                            {/* 中部：左側にチーム名・対戦チーム名、右側にスコア */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                {/* チーム名 */}
                                <div className="text-base font-medium">
                                  {teamDisplayName}
                                </div>
                                {/* vs 対戦チーム名 */}
                                <div className="text-lg">
                                  vs {opponentDisplayName}
                                </div>
                              </div>
                              {/* スコア */}
                              <div className="text-4xl font-bold">
                                {ourScore ?? 0} - {opponentScore ?? 0}
                              </div>
                            </div>
                            
                            {/* 下部：責任投手（横並び） */}
                            <div className="flex items-center gap-3 flex-wrap min-h-8">
                              {game.win_pitcher && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-base font-medium rounded">
                                    勝
                                  </span>
                                  <span className="text-base text-foreground">{game.win_pitcher}</span>
                                </div>
                              )}
                              {game.lose_pitcher && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-base font-medium rounded">
                                    負
                                  </span>
                                  <span className="text-base text-foreground">{game.lose_pitcher}</span>
                                </div>
                              )}
                            </div>
                          </>
                        );
                        
                        return gameHref ? (
                          <Link
                            key={game.key}
                            href={gameHref}
                            className="block border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={game.key} className="border rounded-lg p-4 space-y-3">
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PC表示：月ごとに3試合ずつ1行で横並び */}
            <div className="hidden md:block space-y-6">
              {sortedMonths.map((monthKey) => {
                const monthGames = gamesByMonth.get(monthKey) || [];
                if (monthGames.length === 0) return null;
                
                const month = parseInt(monthKey.slice(4, 6));
                
                return (
                  <div key={monthKey}>
                    {/* 月のヘッダー */}
                    <div className="w-full bg-[#333333] text-white text-lg font-bold mb-4 pt-2 pb-2 px-4 rounded">
                      {month}月
                    </div>
                    
                    {/* 試合を2列のグリッドで表示 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {monthGames.map((game) => {
                        const ourTeamName = getTeamNameByKey(teamKeyToName, game.team);
                        const ourTeamKey = game.team;
                        const gameHref = getGameDetailHref(game);
                        
                        // 対戦相手を判定
                        const isTopTeam = ourTeamName && game.top_team === ourTeamName;
                        const opponentTeamRaw = isTopTeam ? game.bottom_team : game.top_team;
                        
                        // スコアを表示（自チーム - 相手チーム）
                        const ourScore = isTopTeam ? game.top_team_score : game.bottom_team_score;
                        const opponentScore = isTopTeam ? game.bottom_team_score : game.top_team_score;
                        
                        // チーム名を表示（括弧内があれば括弧内を優先）
                        const teamDisplayName = getDisplayTeamName(ourTeamName, ourTeamKey);
                        const opponentDisplayName = getDisplayTeamName(opponentTeamRaw, opponentTeamRaw);
                        
                        const gameDate = parseDate(game.date);
                        
                        const content = (
                          <>
                            {/* 上部：日と曜日 */}
                            <div className="text-base font-medium">
                              {gameDate ? `${gameDate.getDate()}(${getDayOfWeek(gameDate)})` : ""}
                            </div>
                            
                            {/* 中部：左側にチーム名・対戦チーム名、右側にスコア */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                {/* チーム名 */}
                                <div className="text-base font-medium">
                                  {teamDisplayName}
                                </div>
                                {/* vs 対戦チーム名 */}
                                <div className="text-lg">
                                  vs {opponentDisplayName}
                                </div>
                              </div>
                              {/* スコア */}
                              <div className="text-4xl font-bold">
                                {ourScore ?? 0} - {opponentScore ?? 0}
                              </div>
                            </div>
                            
                            {/* 下部：責任投手（横並び） */}
                            <div className="flex items-center gap-3 flex-wrap min-h-8">
                              {game.win_pitcher && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-base font-medium rounded">
                                    勝
                                  </span>
                                  <span className="text-base text-foreground">{game.win_pitcher}</span>
                                </div>
                              )}
                              {game.lose_pitcher && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-base font-medium rounded">
                                    負
                                  </span>
                                  <span className="text-base text-foreground">{game.lose_pitcher}</span>
                                </div>
                              )}
                            </div>
                          </>
                        );
                        
                        return gameHref ? (
                          <Link
                            key={game.key}
                            href={gameHref}
                            className="block border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div key={game.key} className="border rounded-lg p-4 space-y-3">
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* ナビゲーション（下部） */}
        <div className="mt-6 pb-2">
          <CalendarNavigation />
        </div>
      </CardContent>
    </Card>
  );
}
