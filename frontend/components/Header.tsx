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

  // メニューが開いているときはスクロールを禁止
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      if (prev) {
        setIsTeamOpen(false);
        setOpenTeamKey(null);
      }
      return !prev;
    });
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsTeamOpen(false);
    setOpenTeamKey(null);
  };

  const toggleTeam = () => {
    setIsTeamOpen((prev) => {
      if (prev) setOpenTeamKey(null);
      return !prev;
    });
  };

  const toggleTeamSub = (key: string) => {
    setOpenTeamKey(openTeamKey === key ? null : key);
  };

  const contactUrl = process.env.NEXT_PUBLIC_CONTACT_FORM_URL;

  const navItems = [
    { href: "/", label: "トップ" },
    { href: "/game", label: "試合結果" },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{
          background: "linear-gradient(135deg, #0d1526 0%, #0a1428 60%, #0f1e35 100%)",
          borderBottom: "1px solid rgba(245,158,11,0.15)",
        }}
      >
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
                style={{
                  color: "#f1f5f9",
                  fontFamily: "var(--font-oswald), sans-serif",
                  letterSpacing: "0.08em",
                }}
              >
                草野球レポート
              </span>
            </Link>

            {/* ハンバーガーボタン */}
            <button
              type="button"
              className="p-2 rounded-md focus:outline-none transition-colors duration-200"
              style={{ color: "rgb(241, 245, 249)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgb(241, 245, 249)";
              }}
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
        </div>
      </header>

      {/* オーバーレイ */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* 右側ドロワーメニュー */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out",
        )}
        style={{
          width: "280px",
          background: "linear-gradient(180deg, #0d1526 0%, #0a1428 100%)",
          borderLeft: "1px solid rgba(245,158,11,0.2)",
          boxShadow: isMenuOpen ? "-8px 0 32px rgba(0,0,0,0.6)" : "none",
          transform: isMenuOpen ? "translateX(0)" : "translateX(100%)",
        }}
        role="dialog"
        aria-label="ナビゲーションメニュー"
        aria-modal="true"
      >
        {/* ドロワーヘッダー */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(245,158,11,0.15)" }}
        >
          <span
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: "#f59e0b", fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Menu
          </span>
          <button
            type="button"
            className="p-1.5 rounded-md transition-colors duration-200"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
            }}
            onClick={closeMenu}
            aria-label="メニューを閉じる"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* 通常ナビアイテム */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all duration-200"
              style={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(245,158,11,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
            >
              <span style={{ color: "#f59e0b", fontSize: "0.6rem" }}>▶</span>
              {item.label}
            </Link>
          ))}

          {/* チーム プルダウン */}
          <div>
            <button
              type="button"
              className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-medium transition-all duration-200"
              style={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
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
                <span style={{ color: "#f59e0b", fontSize: "0.6rem" }}>▶</span>
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

          {/* お問い合わせリンク */}
          {contactUrl && (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-3 mx-3 my-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{
                color: "rgb(241, 245, 249)",
                border: "1px solid #f59e0b",
                background: "linear-gradient(rgb(13, 21, 38) 0%, rgb(10, 20, 40) 100%)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b";
                (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(rgb(30, 42, 65) 0%, rgb(20, 35, 58) 100%)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgb(241, 245, 249)";
                (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(rgb(13, 21, 38) 0%, rgb(10, 20, 40) 100%)";
              }}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              お問い合わせ
            </a>
          )}
        </nav>

        {/* ドロワーフッター */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(245,158,11,0.1)" }}
        >
          <p className="text-xs" style={{ color: "#334155" }}>
            ⚾ 草野球レポート
          </p>
        </div>
      </div>
    </>
  );
}
