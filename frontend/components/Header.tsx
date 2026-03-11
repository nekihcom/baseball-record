"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn, getDisplayTeamName } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/types";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [openTeamKey, setOpenTeamKey] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTeams() {
      const { data } = await supabase
        .from("master_teams_info")
        .select("*")
        .eq("delete_flg", 0)
        .order("key", { ascending: true });
      if (!cancelled && data) {
        setTeams(data as Team[]);
      }
    }
    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsTeamOpen(false);
      setOpenTeamKey(null);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsTeamOpen(false);
    setOpenTeamKey(null);
  };

  const toggleTeam = () => {
    setIsTeamOpen(!isTeamOpen);
    if (isTeamOpen) {
      setOpenTeamKey(null);
    }
  };

  const toggleTeamSub = (key: string) => {
    setOpenTeamKey(openTeamKey === key ? null : key);
  };

  const navItems = [
    { href: "/", label: "トップ" },
    { href: "/game", label: "試合結果" },
  ];

  return (
    <header className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg, #0d1526 0%, #0a1428 60%, #0f1e35 100%)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
      <div className="container mx-auto max-w-[1024px] px-4">
        <nav className="flex items-center justify-between py-3">
          {/* ロゴ */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl">⚾</span>
            <span
              className="font-sport text-xl font-bold tracking-widest transition-colors duration-200 group-hover:text-amber-400"
              style={{ color: "#f1f5f9", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.08em" }}
            >
              草野球レポート
            </span>
          </Link>

          {/* ハンバーガーボタン */}
          <button
            type="button"
            className="p-2 rounded-md focus:outline-none transition-colors duration-200"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
            onClick={toggleMenu}
            aria-label="メニューを開く"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              style={{ transform: isMenuOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* ドロップダウンメニュー */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div
            className="mb-3 rounded-xl overflow-hidden"
            style={{
              background: "#111827",
              border: "1px solid rgba(245,158,11,0.15)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* 通常ナビアイテム */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 border-b"
                style={{ color: "#94a3b8", borderColor: "rgba(255,255,255,0.05)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(245,158,11,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "24px";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "20px";
                }}
              >
                <span style={{ color: "#f59e0b", fontSize: "0.65rem" }}>▶</span>
                {item.label}
              </Link>
            ))}

            {/* チーム プルダウン */}
            <div>
              <button
                type="button"
                className="flex items-center justify-between w-full px-5 py-3 text-sm font-medium transition-all duration-200"
                style={{ color: "#94a3b8" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
                onClick={toggleTeam}
              >
                <span className="flex items-center gap-3">
                  <span style={{ color: "#f59e0b", fontSize: "0.65rem" }}>▶</span>
                  チーム
                </span>
                <svg
                  className="w-4 h-4 transition-transform duration-200"
                  style={{ transform: isTeamOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  isTeamOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div style={{ background: "rgba(0,0,0,0.2)" }}>
                  {teams.map((team) => {
                    const displayName = getDisplayTeamName(team.team_name, team.key);
                    const isOpen = openTeamKey === team.key;
                    return (
                      <div key={team.key}>
                        <button
                          type="button"
                          className="flex items-center justify-between w-full px-8 py-2.5 text-sm transition-all duration-200"
                          style={{ color: "#64748b" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.04)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          }}
                          onClick={() => toggleTeamSub(team.key)}
                        >
                          <span>{displayName}</span>
                          <svg
                            className="w-3 h-3 transition-transform duration-200"
                            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-200 ease-in-out",
                            isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="px-12 py-1 space-y-0.5" style={{ background: "rgba(0,0,0,0.15)" }}>
                            <Link
                              href={`/team/${team.key}/stats`}
                              onClick={closeMenu}
                              className="flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all duration-200"
                              style={{ color: "#64748b" }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b";
                                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(245,158,11,0.08)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
                                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                              }}
                            >
                              チーム成績
                            </Link>
                            <Link
                              href={`/team/${team.key}/player`}
                              onClick={closeMenu}
                              className="flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all duration-200"
                              style={{ color: "#64748b" }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b";
                                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(245,158,11,0.08)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
                                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                              }}
                            >
                              選手一覧
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
