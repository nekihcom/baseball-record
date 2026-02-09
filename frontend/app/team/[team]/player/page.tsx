"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Player, Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

type Props = { params: Promise<{ team: string }> };

export default function TeamPlayersPage({ params }: Props) {
  const router = useRouter();
  const { setBreadcrumbSegments, clearBreadcrumb } = useBreadcrumb();
  const [teamKey, setTeamKey] = useState<string>("");
  const [teamInfo, setTeamInfo] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setTeamKey(resolvedParams.team);
    });
  }, [params]);

  useEffect(() => {
    clearBreadcrumb();
  }, [clearBreadcrumb]);

  useEffect(() => {
    if (teamInfo) {
      const teamName = teamInfo.team_name ?? teamInfo.team ?? teamKey ?? "—";
      setBreadcrumbSegments([
        { label: "チーム一覧", href: "/team" },
        { label: `チーム成績(${teamName})`, href: `/team/${teamKey}/stats` },
        { label: "選手一覧" },
      ]);
    }
    return () => clearBreadcrumb();
  }, [teamInfo, teamKey, setBreadcrumbSegments, clearBreadcrumb]);

  useEffect(() => {
    if (!teamKey) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setError(null);

        const [teamRes, playersRes] = await Promise.all([
          supabase
            .from("master_teams_info")
            .select("*")
            .eq("key", teamKey)
            .eq("delete_flg", 0)
            .single(),
          supabase
            .from("master_players_info")
            .select("*")
            .eq("team", teamKey)
            .eq("delete_flg", 0)
            .order("player_number", { ascending: true }),
        ]);

        if (cancelled) return;

        if (teamRes.error) {
          setError(teamRes.error.message);
          setTeamInfo(null);
          return;
        }

        setTeamInfo(teamRes.data as Team);
        setPlayers((playersRes.data ?? []) as Player[]);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
        setTeamInfo(null);
        setPlayers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [teamKey]);

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

  if (error || !teamInfo) {
    return (
      <div className="space-y-6">
        <Button onClick={() => router.push("/team")} variant="outline" size="sm">
          チーム一覧へ
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error ?? "チームが見つかりませんでした"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="text-2xl">
              {teamInfo.team_name ?? teamInfo.team ?? teamKey ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-4">
        {players.length === 0 ? (
          <div className="text-center py-12 text-base text-muted-foreground">
            所属選手はいません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {players.map((player) => {
              const playerHref =
                player.player_number != null
                  ? `/team/${teamKey}/player/${player.player_number}`
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
                          {player.player_name || player.nickname || "—"}
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
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
