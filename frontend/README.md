# baseball-record フロントエンド

野球記録データ（Supabase）を閲覧するための Next.js Web アプリです。

## 技術スタック

| 技術 | バージョン |
|---|---|
| Next.js | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Radix UI | 各種 |
| Supabase JS | 2.x |
| Vercel Analytics | 1.x |

## セットアップ

```bash
cd frontend

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env に Supabase の URL と匿名キーを設定する
```

### 環境変数

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの匿名キー（クライアント公開用） |

## 開発

```bash
npm run dev     # 開発サーバー起動（http://localhost:3000）
npm run build   # 本番ビルド
npm run lint    # ESLint
```

## ページ構成

| パス | 概要 |
|---|---|
| `/` | トップページ（チーム一覧・各チームへのリンク） |
| `/game` | 試合結果一覧（日付・チーム・結果でフィルタ可能） |
| `/game/[id]` | 試合詳細（スコアボード・責任投手・打者/投手成績） |
| `/team/[team]` | `/team/[team]/stats` へリダイレクト |
| `/team/[team]/stats` | チーム成績（今年度/通算/月別タブ） |
| `/team/[team]/player` | 選手一覧 |
| `/team/[team]/player/[player_number]` | 選手詳細（成績・月別・打順別等） |
| `/privacy` | プライバシーポリシー |
| `/terms` | 利用規約 |
| `/demo` | UIコンポーネントのデモ |

## コンポーネント一覧

`components/` 配下の主要コンポーネント：

| コンポーネント | 概要 |
|---|---|
| `Header` | ヘッダーナビゲーション（ハンバーガーメニュー対応） |
| `Footer` | フッター |
| `Breadcrumb` / `BreadcrumbContext` | パンくずリスト |
| `PageLayout` | ページ共通レイアウト |
| `Announcements` | お知らせ表示 |
| `TeamSelect` | チーム選択UI |
| `TeamStatsTabs` | チーム成績のタブ管理 |
| `PlayerStatsTabs` | 選手成績のタブ管理 |
| `GameList` | 試合結果一覧（フィルタ機能付き） |
| `HitterStatsTable` / `PitcherStatsTable` | 打者/投手成績テーブル |
| `CurrentYearHitterStats` / `CurrentYearPitcherStats` | 今年度成績 |
| `MonthlyHitterStats` / `MonthlyPitcherStats` | 月別成績 |
| `RecentGamesHitterStats` / `RecentGamesPitcherStats` | 直近試合成績 |
| `BattingOrderHitterStats` | 打順別成績 |
| `PositionHitterStats` | 守備位置別成績 |
| `GroundHitterStats` / `GroundPitcherStats` | 球場別成績 |
| `UsagePitcherStats` | 投手起用別成績 |

UIプリミティブは `components/ui/` 配下に Radix UI ベースのコンポーネント（Button, Card, Dialog, Tabs, Select 等）を配置しています。

## ライブラリ

| ファイル | 概要 |
|---|---|
| `lib/supabase.ts` | Supabase クライアント（クライアントサイド・シングルトン） |
| `lib/supabase-server.ts` | Supabase クライアント（サーバーサイド） |
| `lib/types.ts` | Supabase テーブルに対応する TypeScript 型定義 |
| `lib/statsTypes.ts` | 成績集計用の型定義 |
| `lib/utils.ts` | `cn()`, `getDisplayTeamName()`, `parseInnings()`, `buildGameInfoKey()` 等のユーティリティ |

## 実装パターン

- **Supabase クエリ**: 常に `.eq("delete_flg", 0)` を付与して論理削除レコードを除外する
- **日付形式**: `yyyymmdd` 形式の文字列（例: `"20251130"`）
- **Next.js params**: `params` は `Promise<{ team: string }>` 型。`useEffect` + `.then()` で解決する
- **チーム表示名**: `getDisplayTeamName()` が `team_name` の括弧内テキストを略称として使用
