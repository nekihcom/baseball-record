# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

### バックエンド

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# スクレイピング実行（backend/ ディレクトリから実行すること）
python3 src/00_run_all.py <チーム名>           # 単一チーム
python3 src/00_run_all.py <チーム名> --test    # テストモード（少量データ）

# Supabase データ連携
python3 src/load_to_supabase.py   # 初回一括投入（既存データを削除して再投入）
python3 src/update_supabase.py    # 差分更新（UPSERT）
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev     # 開発サーバー起動（http://localhost:3000）
npm run build   # 本番ビルド
npm run lint    # ESLint
```

## アーキテクチャ

### データフロー

```
外部Webサイト → [Python スクレイピング] → CSV (backend/output/) → [Supabase投入スクリプト] → Supabase (PostgreSQL) → [Next.js フロントエンド]
```

バックエンドとフロントエンドは完全に分離しており、Supabase を介してのみ連携する。

### バックエンド構造

- `backend/src/00_run_all.py` — 01〜06 のスクレイピングスクリプトをサブプロセスで順次実行するオーケストレーター
- `backend/src/01〜06_*.py` — 各スクレイピングスクリプト。`parse_command_line_args()` でチーム名と `--test` フラグを受け取る
- `backend/src/99_utils.py` — 全スクリプト共通ユーティリティ（HTML取得、CSV操作、引数解析、ファイルリネーム）
- `backend/src/constants.py` — 入出力ファイルパスの定数
- `backend/input/00_teams_info.csv` / `01_players_info.csv` — スクレイピング対象のマスターデータ
- **スクリプトはすべて `backend/` ディレクトリを CWD として実行される**（`00_run_all.py` が `cwd=project_root` で子プロセスを起動）

### フロントエンド構造

- **すべてのページコンポーネントが `"use client"` でクライアントサイドレンダリング**
- `frontend/lib/supabase.ts` — シングルトンの Supabase クライアント（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が必須）
- `frontend/lib/types.ts` — Supabase テーブルに対応する TypeScript 型定義（`Team`, `Player`, `Game`, `HitterStats`, `PitcherStats` など）
- `frontend/lib/statsTypes.ts` — 成績集計用の型定義
- `frontend/lib/utils.ts` — `cn()`, `getDisplayTeamName()`, `parseInnings()`, `buildGameInfoKey()` など共通ユーティリティ

### ルーティング

| パス | 概要 |
|---|---|
| `/` | チーム一覧（トップページ） |
| `/game` | 試合結果一覧 |
| `/game/[id]` | 試合詳細（スコアボード・成績） |
| `/team/[team]` | `/team/[team]/stats` へリダイレクト |
| `/team/[team]/stats` | チーム成績（今年度/通算/月別タブ） |
| `/team/[team]/player` | 選手一覧 |
| `/team/[team]/player/[player_number]` | 選手詳細 |

### 重要な実装パターン

**Supabase クエリ共通ルール**:
- 常に `.eq("delete_flg", 0)` を付与して論理削除レコードを除外する
- 日付は `yyyymmdd` 形式の文字列（例: `"20251130"`）

**player_number の補完**:
- `transaction_*_stats` の `player_number` が null になりうるため、ページコンポーネント側で `master_players_info` を別途取得して選手名から背番号を補完している（`team/[team]/stats/page.tsx` の `enrichHitterStats` / `enrichPitcherStats` 参照）

**Next.js 16 の params**:
- ページコンポーネントの `params` は `Promise<{ team: string }>` 型。`useEffect` + `.then()` で解決する

**チーム表示名**:
- `getDisplayTeamName()` が `team_name` の括弧内テキストを抽出して略称として使用（例: `「スワローズファン友の会(スワ友)」→「スワ友」`）

### データベーステーブル

| テーブル | 種別 |
|---|---|
| `master_teams_info` | チームマスター |
| `master_players_info` | 選手マスター |
| `transaction_game_info` | 試合情報 |
| `transaction_game_hitter_stats` | 試合別打者成績 |
| `transaction_game_pitcher_stats` | 試合別投手成績 |
| `transaction_team_stats` | チーム年度別成績 |
| `transaction_hitter_stats` | 打者年度別成績 |
| `transaction_pitcher_stats` | 投手年度別成績 |

全テーブル共通: `key` (PK), `delete_flg` (0=有効/1=削除), `created_dt`, `updated_dt`

## Git 運用ルール

### ブランチ

- 以下の操作は作業開始時に必ず行ってください
  - **作業開始時**: 必ず専用ブランチを作成する（feature/* 、fix/*等）
  - **mainブランチでの直接作業は絶対禁止**: いかなる変更もmainブランチに直接コミットしない
- 以下を必ず作業終了時に実行してください。
  1. 作業内容をコミット
  2. リモートブランチにpush
  3. PR作成

## 修正の際の注意点
- 修正を行う際には必ず以下のことに順守してください
  - 該当修正によって他の処理に問題がないか慎重に確認を行って作業を行ってください。
  - 他の動作に関しても修正が必要な場合は既存の期待値の動作が正常に起動するように修正してください。

## コミット前に確認すること（必ず実施）
- コミット前には必ず動作確認を行って動作が問題ないかを確認してください
  - 動作確認中にエラーが発見された際はタスクを更新してください
  - コミットする際はエラーがない状態で行ってください
  - テスト完了、ビルドエラーゼロであることが確認できたらコミットしてください

| ブランチ | 用途 | 命名 |
|---|---|---|
| `main` | 本番リリース済み | — |
| `develop` | 開発統合 | — |
| `feature/*` | 新機能 | `feature/<issue番号>-<概要>` |
| `fix/*` | バグ修正 | `fix/<issue番号>-<概要>` |
| `hotfix/*` | 本番緊急修正 | `hotfix/<概要>` |
| `chore/*` | リファクタリング・設定・ドキュメント | `chore/<概要>` |

- `main` / `develop` への直接コミット禁止。必ず PR 経由
- `feature/*` / `fix/*` / `chore/*` は `develop` から分岐し `develop` へマージ
- `hotfix/*` は `main` から分岐し `main` と `develop` 両方にマージ

### コミットメッセージ

```
${絵文字} ${区分}: ${内容（日本語、50文字以内）}
```

| 絵文字 | 区分 | 用途 |
|---|---|---|
| ✨ | feat | 新機能 |
| 🐛 | fix | バグ修正 |
| 🔥 | hotfix | 本番緊急修正 |
| ♻️ | refactor | リファクタリング |
| 📝 | docs | ドキュメント |
| 🎨 | style | コードスタイル |
| ✅ | test | テスト |
| 🔧 | chore | 設定・ビルド・依存関係 |
| 🗃️ | db | DB関連 |
| ⬆️ | deps | 依存パッケージ更新 |
| 🚀 | perf | パフォーマンス改善 |

## その他留意事項
- コミットやPRなどリモートリポジトリを更新する操作をする際、メッセージにClaude Codeで作成されたことは含めないでください。