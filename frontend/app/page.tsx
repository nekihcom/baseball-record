"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/types";
import { getDisplayTeamName } from "@/lib/utils";
import { Announcements } from "@/components/Announcements";

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
      <>
        {/* <Announcements /> */}
        <div className="space-y-6 mt-4">
          {/* <div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              チーム選択
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>データを見たいチームを選択してください</p>
          </div> */}
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="sport-spinner" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>読み込み中...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* <Announcements /> */}
        <div className="space-y-4 mt-4">
          {/* <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            チーム選択
          </h2> */}
          <div
            className="p-4 rounded-lg text-sm"
            style={{ background: "var(--color-loss-dim)", border: "1px solid rgba(220,38,38,0.3)", color: "var(--color-loss)" }}
          >
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Announcements />
      <div className="space-y-6 mt-4">
        {/* セクションヘッダー */}
        <div className="animate-fade-slide-up animate-stagger-1">
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            チーム選択
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>データを見たいチームを選択してください</p>
        </div>

        {/* チームグリッド */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {teams.map((team, index) => {
            const teamKey = team.key;
            const displayName = getDisplayTeamName(team.team_name, team.key);
            const staggerClass = `animate-stagger-${Math.min(index + 2, 9)}`;

            return (
              <div
                key={team.key}
                className={`sport-card animate-fade-slide-up ${staggerClass}`}
                style={{ padding: "16px 20px" }}
              >
                {/* チーム名 */}
                <div className="mb-4">
                  <div
                    className="text-xl font-bold leading-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {displayName}
                  </div>
                  {/* フルネーム（略称と同じ場合も高さを確保するため常にレンダリング） */}
                  <div
                    className="mt-0.5 text-xs truncate"
                    style={{
                      color: team.team_name && team.team_name !== displayName ? "var(--text-muted)" : "transparent",
                      userSelect: "none",
                    }}
                    title={team.team_name ?? undefined}
                  >
                    {team.team_name || "\u00a0"}
                  </div>
                </div>

                {/* プライマリアクション: チーム成績 */}
                <Link
                  href={`/team/${teamKey}/stats`}
                  className="flex items-center justify-between w-full rounded-md px-3 py-2 mb-2 text-sm font-medium transition-colors duration-150"
                  style={{
                    background: "var(--color-brand-dim)",
                    color: "var(--text-primary)",
                    border: "1px solid rgba(59,93,188,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(59,93,188,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-brand-dim)";
                  }}
                >
                  チーム成績
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>→</span>
                </Link>

                {/* セカンダリリンク */}
                <div className="flex gap-2">
                  <Link
                    href={`/game?team=${teamKey}`}
                    className="flex-1 text-center text-xs py-1.5 rounded transition-colors duration-150"
                    style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dimmed)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                  >
                    試合結果
                  </Link>
                  <Link
                    href={`/team/${teamKey}/player`}
                    className="flex-1 text-center text-xs py-1.5 rounded transition-colors duration-150"
                    style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dimmed)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                  >
                    選手一覧
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {teams.length === 0 && (
          <div
            className="p-8 rounded-lg text-center text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}
          >
            チームが登録されていません
          </div>
        )}
      </div>
    </>
  );
}
