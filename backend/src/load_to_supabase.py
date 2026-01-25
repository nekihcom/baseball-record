#!/usr/bin/env python3
"""
CSV を読み込み、Supabase の野球記録テーブルに投入するスクリプト。

実行時カレントディレクトリはプロジェクトルートを想定。
.env に SUPABASE_URL と SUPABASE_SERVICE_KEY を設定すること。
"""

from __future__ import annotations

import csv
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# プロジェクトルート = カレントディレクトリ
ROOT = Path.cwd()
INPUT_DIR = ROOT / "input"
OUTPUT_DIR = ROOT / "output"
BATCH_SIZE = 500

# テーブル名 -> (CSV パス, 整数カラム, 小数カラム)
# 実際のCSVヘッダーに準拠（plate_apperance, oponent_error, shotout 等）
LOAD_CONFIG = [
    ("master_teams_info", INPUT_DIR / "00_teams_info.csv", [], []),
    ("master_players_info", INPUT_DIR / "01_players_info.csv", ["player_number"], []),
    (
        "transaction_game_info",
        OUTPUT_DIR / "01_game_info.csv",
        [
            "top_team_score",
            "bottom_team_score",
            "top_inning_score_1",
            "top_inning_score_2",
            "top_inning_score_3",
            "top_inning_score_4",
            "top_inning_score_5",
            "top_inning_score_6",
            "top_inning_score_7",
            "top_inning_score_8",
            "top_inning_score_9",
            "bottom_inning_score_1",
            "bottom_inning_score_2",
            "bottom_inning_score_3",
            "bottom_inning_score_4",
            "bottom_inning_score_5",
            "bottom_inning_score_6",
            "bottom_inning_score_7",
            "bottom_inning_score_8",
            "bottom_inning_score_9",
        ],
        [],
    ),
    (
        "transaction_game_hitter_stats",
        OUTPUT_DIR / "02_game_hitter_stats.csv",
        [
            "player_number",
            "order",
            "plate_apperance",
            "at_bat",
            "hit",
            "hr",
            "rbi",
            "run",
            "stolen_base",
            "double",
            "triple",
            "at_bat_in_scoring",
            "hit_in_scoring",
            "strikeout",
            "walk",
            "hit_by_pitch",
            "sacrifice_bunt",
            "sacrifice_fly",
            "double_play",
            "oponent_error",
            "own_error",
            "caught_stealing",
        ],
        [],
    ),
    (
        "transaction_game_pitcher_stats",
        OUTPUT_DIR / "03_game_pitcher_stats.csv",
        [
            "player_number",
            "pitches",
            "runs_allowed",
            "earned_runs",
            "hits_allowed",
            "hr_allowed",
            "strikeouts",
            "walks_allowed",
            "hit_batsmen",
            "balks",
            "wild_pitches",
            "order",
        ],
        [],
    ),
    (
        "transaction_team_stats",
        OUTPUT_DIR / "04_team_stats.csv",
        ["year", "games", "wins", "losses", "draws", "runs_scored", "runs_allowed", "home_runs", "stolen_bases"],
        ["winning_percentage", "batting_average", "earned_run_average"],
    ),
    (
        "transaction_hitter_stats",
        OUTPUT_DIR / "05_hitter_stats.csv",
        [
            "year",
            "player_number",
            "games_played",
            "plate_appearance",
            "at_bats",
            "hit",
            "hr",
            "rbi",
            "run",
            "stolen_base",
            "double",
            "triple",
            "total_bases",
            "strikeout",
            "walk",
            "hit_by_pitch",
            "sacrifice_bunt",
            "sacrifice_fly",
            "double_play",
            "opponent_error",
            "own_error",
            "caught_stealing",
        ],
        ["batting_average", "on_base_percentage", "slugging_percentage", "average_in_scoring", "ops"],
    ),
    (
        "transaction_pitcher_stats",
        OUTPUT_DIR / "06_pitcher_stats.csv",
        [
            "year",
            "player_number",
            "games_played",
            "wins",
            "holds",
            "saves",
            "losses",
            "pitches_thrown",
            "runs_allowed",
            "earned_runs_allowed",
            "complete_games",
            "shutouts",
            "hits_allowed",
            "home_runs_allowed",
            "strikeouts",
            "walks_allowed",
            "hit_batters",
            "balks",
            "wild_pitches",
        ],
        ["win_percentage", "era", "strikeout_rate", "k_bb", "whip"],
    ),
]


def _to_int(s: str | None) -> int | None:
    if s is None or (isinstance(s, str) and s.strip() in ("", "-", ".")):
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None


def _to_num(s: str | None) -> float | None:
    if s is None or (isinstance(s, str) and s.strip() in ("", "-")):
        return None
    t = s.strip()
    if t == ".":
        return None
    try:
        return float(t)
    except (ValueError, TypeError):
        return None


def _cell(v: str) -> str | None:
    if v is None:
        return None
    s = v.strip()
    return s if s else None


def _row_to_record(
    headers: list[str],
    row: list[str],
    int_cols: set[str],
    num_cols: set[str],
) -> dict:
    out = {}
    for i, h in enumerate(headers):
        raw = row[i].strip() if i < len(row) else ""
        val: str | int | float | None
        if h in int_cols:
            val = _to_int(raw) if raw else None
        elif h in num_cols:
            val = _to_num(raw) if raw else None
        else:
            val = _cell(raw) if raw else None
        out[h] = val
    return out


def _read_csv(path: Path, int_cols: set[str], num_cols: set[str]) -> list[dict]:
    """CSV を読み込む。key は先頭列としてCSVに含まれる想定。"""
    records = []
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.reader(f)
        raw_headers = next(r, None)
        if not raw_headers:
            return records
        headers = [c.strip() for c in raw_headers]
        for row in r:
            if not row:
                continue
            rec = _row_to_record(headers, row, int_cols, num_cols)
            records.append(rec)
    return records


def _insert_batched(client, table: str, records: list[dict]) -> int:
    """レコードをバッチで投入。削除フラグと日時を自動付与。"""
    now = datetime.now(timezone.utc)
    n = 0
    for i in range(0, len(records), BATCH_SIZE):
        chunk = records[i : i + BATCH_SIZE]
        # 各レコードに削除フラグと日時を追加
        for rec in chunk:
            rec["delete_flg"] = 0
            rec["created_dt"] = now.isoformat()
            rec["updated_dt"] = now.isoformat()
        client.table(table).insert(chunk).execute()
        n += len(chunk)
    return n


def main() -> int:
    load_dotenv()
    url = os.environ.get("SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not key:
        print("SUPABASE_URL と SUPABASE_SERVICE_KEY を .env に設定してください。", file=sys.stderr)
        return 1

    client = create_client(url, key)

    for table, csv_path, int_cols, num_cols in LOAD_CONFIG:
        if not csv_path.exists():
            print(f"スキップ: {csv_path} が存在しません", file=sys.stderr)
            continue
        int_s = set(int_cols)
        num_s = set(num_cols)
        records = _read_csv(csv_path, int_s, num_s)
        if not records:
            print(f"スキップ: {table} ({csv_path}) にデータ行がありません", file=sys.stderr)
            continue
        try:
            inserted = _insert_batched(client, table, records)
            print(f"投入: {table} {inserted} 件")
        except Exception as e:
            print(f"エラー: {table} - {e}", file=sys.stderr)
            return 1

    print("投入完了")
    return 0


if __name__ == "__main__":
    sys.exit(main())
