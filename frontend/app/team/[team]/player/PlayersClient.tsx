"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Player, Team } from "@/lib/types";
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
        { label: teamName, href: `/team/${teamKey}/stats` },
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
          <div className="sport-spinner" />
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !teamInfo) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.push("/team")}
          className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.4)";
            (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
          }}
        >
          ← チーム一覧へ
        </button>
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
        >
          {error ?? "チームが見つかりませんでした"}
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 p-4">
        {/* チーム名ヘッダー */}
        <div className="animate-fade-slide-up animate-stagger-1">
          <div className="section-header">
            <h1
              className="font-sport text-2xl font-bold"
              style={{ color: "#f1f5f9", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.04em" }}
            >
              {teamInfo.team_name ?? teamInfo.team ?? teamKey ?? "—"}
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "4px" }}>選手一覧</p>
        </div>

        {/* 選手グリッド */}
        {players.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p style={{ color: "#64748b" }}>所属選手はいません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {players.map((player, index) => {
              const playerHref =
                player.player_number != null
                  ? `/team/${teamKey}/player/${player.player_number}`
                  : null;

              const staggerClass = `animate-stagger-${Math.min(index + 2, 9)}`;

              const cardContent = (
                <div
                  className={`sport-card animate-fade-slide-up ${staggerClass} flex items-center gap-5 px-6 py-4`}
                  style={{ cursor: playerHref ? "pointer" : "default" }}
                >
                  {/* 背番号 */}
                  <div
                    className="font-mono-num text-4xl font-bold shrink-0"
                    style={{
                      color: "#f59e0b",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      minWidth: "3rem",
                      textAlign: "center",
                      lineHeight: 1,
                    }}
                  >
                    {player.player_number != null ? `${player.player_number}` : "—"}
                  </div>

                  {/* 縦線 */}
                  <div
                    style={{
                      width: "1px",
                      height: "36px",
                      background: "rgba(245,158,11,0.2)",
                      flexShrink: 0,
                    }}
                  />

                  {/* 選手名 */}
                  <div>
                    <p
                      className="text-base font-medium"
                      style={{ color: "#f1f5f9", lineHeight: 1.3 }}
                    >
                      {player.player_name || player.nickname || "—"}
                    </p>
                    {player.nickname && player.player_name && player.nickname !== player.player_name && (
                      <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "2px" }}>
                        {player.nickname}
                      </p>
                    )}
                  </div>
                </div>
              );

              return playerHref ? (
                <Link key={player.key} href={playerHref}>
                  {cardContent}
                </Link>
              ) : (
                <div key={player.key}>{cardContent}</div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
