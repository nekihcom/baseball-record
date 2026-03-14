import type { NextConfig } from "next";
import path from "path";

// Google Fonts・Supabase・Vercel Analytics のみを許可する CSP
const cspValue = [
  "default-src 'self'",
  // Next.js hydration スクリプト（inline）と Vercel Analytics スクリプトを許可
  "script-src 'self' 'unsafe-inline' va.vercel-scripts.com",
  // Tailwind / Next.js inline スタイル + Google Fonts CSS
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  // Google Fonts フォントファイル
  "font-src 'self' fonts.gstatic.com",
  // SVG / データ URI 画像
  "img-src 'self' data: blob:",
  // Supabase API + Vercel Analytics API
  "connect-src 'self' *.supabase.co vitals.vercel-insights.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspValue,
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    // ルートの package-lock.json を検出して workspace root を誤認識するのを防ぐ
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
