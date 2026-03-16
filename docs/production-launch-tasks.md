# 本番公開に向けたタスク一覧

> 作成日: 2026-03-13

## 🔴 必須（Critical）

| # | タスク | 概要 | 対象 |
|---|---|---|---|
| 1 | **`app/error.tsx` の実装** | Supabase接続エラー等でページが壊れたままになるのを防ぐ。グローバルエラーバウンダリを追加する | frontend |
| 2 | **セキュリティヘッダーの設定** | `next.config.ts` に `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` 等を追加する | frontend |
| 3 | **Supabase RLS（Row Level Security）の確認・設定** | `anon_key` は公開されるため、意図しないデータ操作（INSERT/UPDATE/DELETE）を防ぐポリシーを設定する | supabase |
| 4 | **`robots.txt` の配置** | クローラーへの指示（公開範囲の制御）。`/public/robots.txt` に配置する | frontend |
| 5 | **環境変数テンプレート（`.env.example`）の作成** | デプロイ環境での設定漏れを防ぐ。必須環境変数を列挙したテンプレートを用意する | frontend / backend |

## 🟠 重要（Important）

| # | タスク | 概要 | 対象 |
|---|---|---|---|
| 6 | **OGP メタデータの設定** | SNSシェア時にリンクカードが表示されない。`og:title`, `og:description`, `og:image` 等を `layout.tsx` に設定する | frontend |
| 7 | **各ページの `generateMetadata()` 実装** | チーム名・選手名等の動的情報をページタイトルに含めてSEOを改善する | frontend |
| 8 | **`sitemap.xml` の動的生成** | 検索エンジンへのインデックスを促進する。`app/sitemap.ts` で動的生成する | frontend |
| 9 | **エラーモニタリングの導入** | 本番エラーを検知できない。Sentry等を導入してエラートラッキングを行う | frontend |
| 10 | **デプロイ先・ホスティング環境の決定と設定** | 現状デプロイ設定がない。Vercel等のホスティングサービスに接続し、環境変数を設定する | frontend |

## 🟡 推奨（Nice to have）

| # | タスク | 概要 | 対象 |
|---|---|---|---|
| 11 | **CSP（Content Security Policy）の設定** | Script/Style/Imageの読み込み元を制限してXSS対策を強化する | frontend |
| 12 | **スクレイピングの定期実行自動化** | 現状は手動実行のみ。GitHub Actions等でcron実行を設定する | backend |
| 13 | **CI/CDパイプライン（lint + build チェック）** | デプロイ品質を担保するためのGitHub Actionsを設定する | frontend / backend |
| 14 | **ローディング状態の統一（`loading.tsx`）** | データ取得中のUXを改善する。各ルートに `loading.tsx` を追加する | frontend |
| 15 | **利用規約・プライバシーポリシーページ** | 第三者サイトのデータをスクレイピングして表示するため、法的リスクの観点からページを用意する | frontend |

## 備考

- **RLSの確認（#3）は最優先**: `anon_key` はクライアントサイドに公開されるため、Supabase側でポリシーが設定されていないとデータ改ざんのリスクがある
- バックエンド（Pythonスクレイピング）はサーバーサイドで手動実行のため、本番公開時の主な作業はフロントエンド側が中心
