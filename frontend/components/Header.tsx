"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      // メニューを閉じるときサブメニューもリセット
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
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto max-w-[1024px] px-4">
        <nav className="flex items-center justify-between py-4">
          {/* ロゴ */}
          <Link
            href="/"
            className="text-xl font-bold"
            onClick={closeMenu}
          >
            （仮称）草野球レポート
          </Link>

          {/* ハンバーガーボタン */}
          <button
            type="button"
            className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={toggleMenu}
            aria-label="メニューを開く"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
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

        {/* メニュー */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="pb-4 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className="w-full justify-start"
                onClick={closeMenu}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}

            {/* チーム プルダウン */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between has-[>svg]:px-4"
                onClick={toggleTeam}
              >
                <span>チーム</span>
                <svg
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isTeamOpen && "rotate-180"
                  )}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  isTeamOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="pl-4 space-y-1">
                  {teams.map((team) => {
                    const displayName = getDisplayTeamName(team.team_name, team.key);
                    const isOpen = openTeamKey === team.key;
                    return (
                      <div key={team.key}>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-sm"
                          onClick={() => toggleTeamSub(team.key)}
                        >
                          <span>{displayName}</span>
                          <svg
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </Button>

                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-200 ease-in-out",
                            isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="pl-4 space-y-1">
                            <Button
                              asChild
                              variant="ghost"
                              className="w-full justify-start text-sm"
                              onClick={closeMenu}
                            >
                              <Link href={`/team/${team.key}/stats`}>
                                チーム成績
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="ghost"
                              className="w-full justify-start text-sm"
                              onClick={closeMenu}
                            >
                              <Link href={`/team/${team.key}/player`}>
                                選手一覧
                              </Link>
                            </Button>
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
