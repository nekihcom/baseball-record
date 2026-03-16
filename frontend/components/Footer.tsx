import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="py-5 text-center text-sm"
      style={{
        background: "#060a14",
        borderTop: "1px solid rgba(245,158,11,0.1)",
        color: "#64748b",
      }}
    >
      <div className="container mx-auto max-w-[1024px] px-4">
        <div className="flex flex-col items-center gap-3">
          <span className="text-lg">⚾</span>
          <div className="flex items-center gap-4" style={{ fontSize: "0.75rem" }}>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              利用規約
            </Link>
            <span style={{ color: "#334155" }}>|</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              プライバシーポリシー
            </Link>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.8rem", letterSpacing: "0.05em" }}>
            © {new Date().getFullYear()} 草野球レポート
          </p>
        </div>
      </div>
    </footer>
  );
}
