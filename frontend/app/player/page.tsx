"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Player, Team } from "@/lib/types";
import { getDisplayTeamName as getDisplayTeamNameUtil } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamSelect } from "@/components/TeamSelect";
import { PageLayout } from "@/components/PageLayout";

/** チーム名から表示用の名前を抽出（括弧内があれば括弧内を優先） */
function getDisplayTeamName(teamName: string | null, teamKey: string | null): string {
  return getDisplayTeamNameUtil(teamName, teamKey);
}

export default function PlayersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamKeyToName, setTeamKeyToName] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータから初期値を読み込む
  const getInitialTeam = () => {
    const teamParam = searchParams.get("team");
    return teamParam || null;
  };

  const [selectedTeam, setSelectedTeam] = useState<string | null>(getInitialTeam);

  // URLパラメータを更新する関数
  const updateURLParams = (team: string | null) => {
    const params = new URLSearchParams();
    if (team) {
      params.set("team", team);
    }
    const queryString = params.toString();
    const newURL = queryString ? `/player?${queryString}` : "/player";
    router.replace(newURL);
  };

  // チームリストと選手リストを取得
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setError(null);

        const [teamsRes, playersRes] = await Promise.all([
          supabase
            .from("master_teams_info")
            .select("key, team_name")
            .eq("delete_flg", 0),
          supabase
            .from("master_players_info")
            .select("*")
            .eq("delete_flg", 0)
            .order("player_number", { ascending: true }),
        ]);

        if (cancelled) return;

        if (teamsRes.error) {
          setError(teamsRes.error.message);
          return;
        }

        if (playersRes.error) {
          setError(playersRes.error.message);
          setPlayers([]);
          return;
        }

        setPlayers((playersRes.data ?? []) as Player[]);

        const map = new Map<string, string>();
        if (teamsRes.data) {
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
        setPlayers([]);
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

  // 選択したチームで選手データをフィルタリング
  const filteredPlayers = useMemo(() => {
    if (!selectedTeam) return [];
    return players.filter((player) => player.team === selectedTeam);
  }, [players, selectedTeam]);

  // 選択されたチーム名を取得
  const selectedTeamName = useMemo(() => {
    if (!selectedTeam) return null;
    return teamKeyToName.get(selectedTeam) || null;
  }, [selectedTeam, teamKeyToName]);

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
          <CardTitle>選手一覧</CardTitle>
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

  return (
    <PageLayout
      headerContent={
        <TeamSelect
          selectedTeam={selectedTeam}
          onTeamChange={(team) => {
            setSelectedTeam(team);
            updateURLParams(team);
          }}
          teamList={teamList}
        />
      }
    >
      {!selectedTeam ? (
        <div className="text-center py-12 text-base text-muted-foreground">
          チームを選択してください
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 text-base text-muted-foreground">
              選手が見つかりませんでした
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredPlayers.map((player) => {
                const playerHref =
                  player.team && player.player_number != null
                    ? `/player/${player.team}/${player.player_number}`
                    : null;

                const content = (
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="px-6">
                      <div className="flex items-center gap-6">
                        <div className="min-w-10">
                          <p className="text-3xl font-bold">
                            {player.player_number != null ? `${player.player_number}` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xl font-medium">
                            {player.player_name || player.nickname ||　"—"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );

                return playerHref ? (
                  <Link key={player.key} href={playerHref}>
                    {content}
                  </Link>
                ) : (
                  <div key={player.key}>{content}</div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
