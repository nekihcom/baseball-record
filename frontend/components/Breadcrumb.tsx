"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { BreadcrumbContext } from "./BreadcrumbContext";

const PATH_LABELS: Record<string, string> = {
  "/game": "試合結果",
  "/player": "選手一覧",
  "/team": "チーム一覧",
  "/demo": "デモ",
};

type PendingSegment = { label: string; href?: string };

/** 動的ルートでデータ未読込時、誤った情報を出さないためローディング表示のみ（/team/ は上で null 返すため対象外） */
function getPendingSegments(pathname: string): PendingSegment[] | null {
  if (pathname.startsWith("/player/")) return [{ label: "読み込み中..." }];
  if (pathname.startsWith("/game/")) return [{ label: "読み込み中..." }];
  return null;
}

function getDefaultPageLabel(pathname: string): string | null {
  if (pathname === "/") return null;
  if (PATH_LABELS[pathname]) return PATH_LABELS[pathname];
  if (pathname.startsWith("/game/")) return "試合詳細";
  if (pathname.startsWith("/player/")) return "選手詳細";
  if (pathname.startsWith("/team/")) return "チーム成績";
  return "ページ";
}

const separatorStyle = { color: "#f59e0b", fontSize: "0.6rem", opacity: 0.6 };
const linkStyle = { color: "#64748b", transition: "color 0.2s ease" };
const currentStyle = { color: "#f1f5f9", fontWeight: 500 };

function BreadcrumbItem({
  label,
  href,
  isCurrent,
}: {
  label: string;
  href?: string;
  isCurrent?: boolean;
}) {
  if (href && !isCurrent) {
    return (
      <li>
        <Link
          href={href}
          className="transition-colors duration-200"
          style={linkStyle}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#64748b"; }}
        >
          {label}
        </Link>
      </li>
    );
  }
  return (
    <li style={isCurrent ? currentStyle : undefined} aria-current={isCurrent ? "page" : undefined}>
      {label}
    </li>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const ctx = useContext(BreadcrumbContext) ?? null;

  if (pathname === "/" || ctx?.hideBreadcrumb) return null;

  // リストページではコンテキストを参照しない（前の詳細ページのパンくずが残らないようにする）
  const isListPage = pathname === "/player" || pathname === "/team" || pathname === "/game";

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.8125rem",
    color: "#64748b",
    flexWrap: "wrap" as const,
    width: "fit-content",
    marginBottom: "16px",
  };

  // 動的ルートでコンテキストが設定されている場合（リストページ以外）
  if (!isListPage && ctx?.breadcrumb) {
    if (ctx.breadcrumb.type === "label") {
      return (
        <nav aria-label="パンくず">
          <ol style={containerStyle}>
            <BreadcrumbItem label="トップ" href="/" />
            <li aria-hidden="true" style={separatorStyle}>▶</li>
            <BreadcrumbItem label={ctx.breadcrumb.label} isCurrent />
          </ol>
        </nav>
      );
    }
    if (ctx.breadcrumb.type === "segments" && ctx.breadcrumb.segments.length > 0) {
      const segments = ctx.breadcrumb.segments;
      return (
        <nav aria-label="パンくず">
          <ol style={containerStyle}>
            <BreadcrumbItem label="トップ" href="/" />
            {segments.flatMap((seg, i) => [
              <li key={`sep-${i}`} aria-hidden="true" style={separatorStyle}>▶</li>,
              <BreadcrumbItem
                key={`seg-${i}`}
                label={seg.label}
                href={seg.href}
                isCurrent={i === segments.length - 1}
              />,
            ])}
          </ol>
        </nav>
      );
    }
  }

  // チーム系動的ルートでは ctx.breadcrumb が入るまでパンくずを出さない（誤表示を防ぐ）
  if (pathname.startsWith("/team/")) return null;

  // 動的ルートでデータ未読込時は親階層のみ表示（「選手詳細」等の一瞬表示を防ぐ）
  const pendingSegments = getPendingSegments(pathname);
  if (pendingSegments && pendingSegments.length > 0) {
    return (
      <nav aria-label="パンくず">
        <ol style={containerStyle}>
          <BreadcrumbItem label="トップ" href="/" />
          {pendingSegments.flatMap((seg, i) => [
            <li key={`sep-${i}`} aria-hidden="true" style={separatorStyle}>▶</li>,
            <BreadcrumbItem
              key={`seg-${i}`}
              label={seg.label}
              href={seg.href}
              isCurrent={i === pendingSegments.length - 1}
            />,
          ])}
        </ol>
      </nav>
    );
  }

  // パスベースのデフォルト表示
  const pageLabel = getDefaultPageLabel(pathname);
  if (!pageLabel) return null;

  return (
    <nav aria-label="パンくず">
      <ol style={containerStyle}>
        <BreadcrumbItem label="トップ" href="/" />
        <li aria-hidden="true" style={separatorStyle}>▶</li>
        <li style={currentStyle} aria-current="page">
          {pageLabel}
        </li>
      </ol>
    </nav>
  );
}
