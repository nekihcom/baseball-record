"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="pb-4 space-y-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}
