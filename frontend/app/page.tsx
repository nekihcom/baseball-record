"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/types";
import { getDisplayTeamName } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTeams() {
      try {
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("master_teams_info")
          .select("*")
          .eq("delete_flg", 0)
          .order("key", { ascending: true });

        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message);
          setTeams([]);
          return;
        }
        setTeams((data ?? []) as Team[]);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
        setTeams([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold mb-2">データを見たいチームを選択してください</h2>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold mb-2">データを見たいチームを選択してください</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-2">データを見たいチームを選択してください</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {teams.map((team) => {
          const teamKey = team.key;
          const displayName = getDisplayTeamName(team.team_name, team.key);
          return (
            <Card key={team.key}>
              <CardContent className="flex flex-row items-center justify-between gap-6 p-6">
                <CardTitle className="text-xl md:text-2xl shrink-0 m-0">
                  {displayName}
                </CardTitle>
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  <li>
                    <Link
                      href={`/game?team=${teamKey}`}
                      className="text-primary hover:underline text-sm"
                    >
                      試合結果
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/team/${teamKey}/stats`}
                      className="text-primary hover:underline text-sm"
                    >
                      チーム成績
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/team/${teamKey}/player`}
                      className="text-primary hover:underline text-sm"
                    >
                      選手一覧
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">チームが登録されていません</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
