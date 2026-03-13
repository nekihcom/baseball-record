import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BreadcrumbProvider } from "@/components/BreadcrumbContext";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

const BASE_URL = "https://baseball-record-bi.vercel.app";
const SITE_NAME = "野球記録システム";
const DESCRIPTION = "草野球チームの試合結果・選手成績を記録・公開するシステム";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    url: BASE_URL,
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${jetbrainsMono.variable} ${notoSansJP.variable} antialiased stadium-bg`}
      >
        <BreadcrumbProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto max-w-[1024px] px-2 py-2">
              <Breadcrumb />
              {children}
            </main>
            <Footer />
          </div>
        </BreadcrumbProvider>
        <Analytics />
      </body>
    </html>
  );
}
