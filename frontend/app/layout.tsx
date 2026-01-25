import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "野球記録システム",
  description: "Supabaseに保存された野球記録データを表示",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  野球記録システム
                </Link>
                <div className="flex gap-2">
                  <Button asChild variant="ghost">
                    <Link href="/">ホーム</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/games">試合一覧</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/players">選手一覧</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/teams">チーム一覧</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            <p>© 2025 野球記録システム</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
