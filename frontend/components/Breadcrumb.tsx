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

/** 動的ルートでデータ未読込時、親階層のみ表示するためのセグメント */
function getPendingSegments(pathname: string): PendingSegment[] | null {
  if (pathname.startsWith("/player/")) return [{ label: "選手一覧" }];
  if (pathname.startsWith("/team/")) return [{ label: "チーム一覧" }];
  if (pathname.startsWith("/game/")) return [{ label: "試合結果" }];
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
        <Link href={href} className="hover:text-foreground transition-colors">
          {label}
        </Link>
      </li>
    );
  }
  return (
    <li
      className={isCurrent ? "text-foreground font-medium" : undefined}
      aria-current={isCurrent ? "page" : undefined}
    >
      {label}
    </li>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const ctx = useContext(BreadcrumbContext) ?? null;

  if (pathname === "/") return null;

  // リストページではコンテキストを参照しない（前の詳細ページのパンくずが残らないようにする）
  const isListPage = pathname === "/player" || pathname === "/team" || pathname === "/game";

  // 動的ルートでコンテキストが設定されている場合（リストページ以外）
  if (!isListPage && ctx?.breadcrumb) {
    if (ctx.breadcrumb.type === "label") {
      return (
        <nav aria-label="パンくず" className="mb-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap w-fit">
            <BreadcrumbItem label="TOP" href="/" />
            <li aria-hidden="true">{" > "}</li>
            <BreadcrumbItem label={ctx.breadcrumb.label} isCurrent />
          </ol>
        </nav>
      );
    }
    if (ctx.breadcrumb.type === "segments" && ctx.breadcrumb.segments.length > 0) {
      const segments = ctx.breadcrumb.segments;
      return (
        <nav aria-label="パンくず" className="mb-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap w-fit">
            <BreadcrumbItem label="TOP" href="/" />
            {segments.flatMap((seg, i) => [
              <li key={`sep-${i}`} aria-hidden="true">
                {" > "}
              </li>,
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

  // 動的ルートでデータ未読込時は親階層のみ表示（「選手詳細」等の一瞬表示を防ぐ）
  const pendingSegments = getPendingSegments(pathname);
  if (pendingSegments && pendingSegments.length > 0) {
    return (
      <nav aria-label="パンくず" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap w-fit">
          <BreadcrumbItem label="TOP" href="/" />
          {pendingSegments.flatMap((seg, i) => [
            <li key={`sep-${i}`} aria-hidden="true">
              {" > "}
            </li>,
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
    <nav aria-label="パンくず" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground w-fit">
        <li>
          <Link href="/" className="hover:text-foreground transition-colors">
            TOP
          </Link>
        </li>
        <li aria-hidden="true">{" > "}</li>
        <li className="text-foreground font-medium" aria-current="page">
          {pageLabel}
        </li>
      </ol>
    </nav>
  );
}
