This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 機能一覧

野球記録データ（Supabase）を表示・検索する Web アプリです。

### 共通

- **ヘッダー** … ホーム・試合一覧・チーム一覧へのナビゲーション（ハンバーガーメニュー対応）

### ホーム（/）

- ダッシュボード
- 試合一覧・チーム一覧へのリンクカード（選手一覧はチーム配下）

### 試合

- **試合一覧（/game）**
  - 日付・チーム・結果によるフィルタ
  - 試合一覧の表示（日付、対戦カード、スコア、結果バッジ）
  - 試合詳細へのリンク
- **試合詳細（/game/[id]）**
  - 試合概要（対戦カード、日付、会場）
  - イニング別スコア表（1〜7回・計）
  - 責任投手（勝・負・S）
  - 打者成績タブ（打順別スタメン成績）
  - 投手成績タブ（登板投手の成績一覧）
  - 戻るボタン（遷移元に応じて戻る or 試合一覧へ）

### チーム

- **チーム一覧（/team）**
  - チーム一覧画面（検索・フィルタは実装中）
- **チーム詳細（/team/[team]/stats）**
  - 今シーズン・通算のチーム成績サマリ
  - 打者成績（今シーズン／通算、選手名から選手詳細へリンク）
  - 投手成績（今シーズン／通算、選手名から選手詳細へリンク）
  - 直近3試合一覧（試合詳細へリンク）
  - 月別成績
  - 選手一覧へのリンク
- **選手一覧（/team/[team]/player）**
  - チームに所属する選手一覧（背番号・名前）
  - 選手詳細へのリンク
- **選手詳細（/team/[team]/player/[player_number]）**
  - **今シーズンの成績**
    - 打者成績（打率・安打・打点・本塁打等）、月別打撃、打順別・守備位置別・塁別打撃
    - 投手成績（防御率・勝敗・奪三振等）、月別投手、登板状況・球種別
  - **通算成績**
    - 打者成績（年度別）、直近試合の打撃成績
    - 投手成績（年度別）、直近試合・登板履歴の投手成績

※ 旧URL（/team/[team]、/player、/player/[id]）は新URLへリダイレクトされます。

### その他

- **デモ（/demo）** … タブ UI のデザインパターンデモ

### 技術・データ

- **Next.js**（App Router）、**Supabase** をデータソースとして利用
- **shadcn/ui** ベースの UI コンポーネント（Card, Tabs, Select, Table 等）

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
