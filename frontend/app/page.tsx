"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/types";
import { getDisplayTeamName } from "@/lib/utils";

const cardLinks = [
  { key: "game", label: "試合結果", path: (teamKey: string) => `/game?team=${teamKey}` },
  { key: "stats", label: "チーム成績", path: (teamKey: string) => `/team/${teamKey}/stats` },
  { key: "player", label: "選手一覧", path: (teamKey: string) => `/team/${teamKey}/player` },
];

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
      <div className="space-y-6">
        <div className="animate-fade-slide-up animate-stagger-1">
          <h2
            className="font-sport text-xl font-semibold mb-1"
            style={{ color: "#f1f5f9", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.06em" }}
          >
            SELECT YOUR TEAM
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>データを見たいチームを選択してください</p>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-4">
            <div className="sport-spinner" />
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2
          className="font-sport text-xl"
          style={{ color: "#f1f5f9", fontFamily: "var(--font-oswald), sans-serif" }}
        >
          SELECT YOUR TEAM
        </h2>
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* セクションヘッダー */}
      <div className="animate-fade-slide-up animate-stagger-1 mt-4">
        <h2
          className="font-sport text-2xl font-bold mb-1"
          style={{ color: "#f1f5f9", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.06em" }}
        >
          SELECT YOUR TEAM
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>データを見たいチームを選択してください</p>
      </div>

      {/* チームグリッド */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {teams.map((team, index) => {
          const teamKey = team.key;
          const displayName = getDisplayTeamName(team.team_name, team.key);
          const staggerClass = `animate-stagger-${Math.min(index + 2, 9)}`;

          return (
            <div
              key={team.key}
              className={`sport-card animate-fade-slide-up ${staggerClass}`}
              style={{ padding: "20px 24px" }}
            >
              {/* チーム名 */}
              <div className="mb-4 pb-3" style={{ borderBottom: "1px solid rgba(245,158,11,0.12)" }}>
                <div
                  className="font-sport text-2xl font-bold"
                  style={{
                    color: "#f1f5f9",
                    fontFamily: "var(--font-oswald), sans-serif",
                    letterSpacing: "0.04em",
                    lineHeight: 1.2,
                  }}
                >
                  {displayName}
                </div>
                <div
                  className="mt-1 text-xs truncate"
                  style={{ color: "#64748b", maxWidth: "100%" }}
                  title={team.team_name ?? undefined}
                >
                  {team.team_name}
                </div>
              </div>

              {/* リンクリスト */}
              <ul className="space-y-1.5 list-none m-0 p-0">
                {cardLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.path(teamKey)}
                      className="flex items-center gap-2 text-sm rounded-md px-3 py-2 transition-all duration-200 group"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.color = "#f59e0b";
                        el.style.background = "rgba(245,158,11,0.08)";
                        el.style.paddingLeft = "16px";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.color = "#94a3b8";
                        el.style.background = "transparent";
                        el.style.paddingLeft = "12px";
                      }}
                    >
                      <span style={{ color: "#f59e0b", fontSize: "0.5rem", opacity: 0.7 }}>▶</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div
          className="p-8 rounded-xl text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p style={{ color: "#64748b" }}>チームが登録されていません</p>
        </div>
      )}
    </div>
  );
}
