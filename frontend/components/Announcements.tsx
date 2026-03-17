"use client";

import { useEffect, useState } from "react";

type AnnouncementState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; lines: string[] };

function formatHeading(heading: string): string {
  return heading.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y, m, d) => `${y}/${Number(m)}/${Number(d)}　`);
}

type BodyToken = { type: "text"; value: string } | { type: "link"; text: string; href: string } | { type: "br" };

function parseBodyTokens(body: string): BodyToken[] {
  const tokens: BodyToken[] = [];
  const tokenPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|<br\s*\/>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(body)) !== null) {
    if (match.index > last) tokens.push({ type: "text", value: body.slice(last, match.index) });
    if (match[0].startsWith("<br")) {
      tokens.push({ type: "br" });
    } else {
      tokens.push({ type: "link", text: match[1], href: match[2] });
    }
    last = match.index + match[0].length;
  }
  if (last < body.length) tokens.push({ type: "text", value: body.slice(last) });
  return tokens;
}

function parseSections(markdown: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = [];
  const lines = markdown.split("\n");
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = line.replace(/^###\s+/, "");
      currentBody = [];
    } else if (!line.startsWith("## ") && !line.startsWith("---")) {
      if (currentHeading) currentBody.push(line);
    }
  }
  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }
  return sections;
}

export function Announcements() {
  const [state, setState] = useState<AnnouncementState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        const res = await fetch("/announcements/content.md");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        setState({ status: "success", lines: text.split("\n") });
      } catch (e) {
        if (cancelled) return;
        setState({ status: "error", message: e instanceof Error ? e.message : "読み込みに失敗しました" });
      }
    }

    fetchContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const sections =
    state.status === "success"
      ? parseSections(state.lines.join("\n"))
      : [];

  return (
    <div
      className="rounded-xl animate-fade-slide-up animate-stagger-1 mt-4"
      style={{
        background: "rgba(26,34,53,0.7)",
        border: "1px solid rgba(245,158,11,0.15)",
        padding: "20px 24px",
      }}
    >
      {/* セクションタイトル */}
      <div
        className="flex items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: "1px solid rgba(245,158,11,0.12)" }}
      >
        <span style={{ color: "#f59e0b", fontSize: "0.55rem" }}>■</span>
        <h2
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: "#f59e0b", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.12em" }}
        >
          お知らせ
        </h2>
      </div>

      {/* ローディング */}
      {state.status === "loading" && (
        <div className="flex items-center gap-3 py-2">
          <div className="sport-spinner" style={{ width: "16px", height: "16px" }} />
          <span style={{ color: "#64748b", fontSize: "0.8125rem" }}>読み込み中...</span>
        </div>
      )}

      {/* エラー */}
      {state.status === "error" && (
        <p style={{ color: "#ef4444", fontSize: "0.8125rem" }}>{state.message}</p>
      )}

      {/* コンテンツ */}
      {state.status === "success" && sections.length === 0 && (
        <p style={{ color: "#64748b", fontSize: "0.8125rem" }}>お知らせはありません</p>
      )}

      {state.status === "success" && sections.length > 0 && (
        <ul className="space-y-4 list-none m-0 p-0">
          {sections.map((section, i) => (
            <li
              key={i}
              className="flex flex-col gap-1"
              style={
                i < sections.length - 1
                  ? { paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }
                  : {}
              }
            >
              <span
                className="text-sm font-semibold"
                style={{ color: "#f1f5f9", fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
              >
                {formatHeading(section.heading)}
              </span>
              {section.body && (
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8", whiteSpace: "pre-wrap" }}>
                  {parseBodyTokens(section.body).map((token, j) =>
                    token.type === "link" ? (
                      <a
                        key={j}
                        href={token.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#f59e0b", textDecoration: "underline" }}
                      >
                        {token.text}
                      </a>
                    ) : token.type === "br" ? (
                      <br key={j} />
                    ) : "value" in token ? (
                      <span key={j}>{token.value}</span>
                    ) : null
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
