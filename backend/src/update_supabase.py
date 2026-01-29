#!/usr/bin/env python3
"""
CSV を読み込み、Supabase の野球記録テーブルを更新するスクリプト。
既存レコードは更新（created_dtは保持）、新規レコードは登録する。

実行時カレントディレクトリはどこでも可（スクリプト配置から backend を基準にパス解決）。
.env はプロジェクトルートまたは backend に SUPABASE_URL と SUPABASE_SERVICE_KEY を設定すること。
"""

from __future__ import annotations

import csv
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# backend ディレクトリ = このスクリプトの親の親（backend/src/update_supabase.py → backend）
BACKEND_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BACKEND_DIR / "input"
OUTPUT_DIR = BACKEND_DIR / "output"
BATCH_SIZE = 500
# 既存レコード取得用のバッチサイズ（IN句の制限を考慮して小さく設定）
EXISTING_RECORDS_BATCH_SIZE = 100

# テーブル名 -> (CSV パス, 整数カラム, 小数カラム)
# 仕様通りに記載順で処理
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


def _get_existing_records_batch(client, table: str, keys: list[str], existing_map: dict[str, dict]) -> None:
    """
    既存レコードをkeyで取得してマップに追加（再帰的にバッチ分割）。
    エラーが発生した場合は、バッチを分割して再試行する。
    """
    if not keys:
        return
    
    try:
        # keyカラムでIN検索
        response = client.table(table).select("key,created_dt").in_("key", keys).execute()
        for record in response.data:
            existing_map[record["key"]] = record
    except Exception:
        # エラーが発生した場合、バッチを分割して再試行
        if len(keys) > 1:
            mid = len(keys) // 2
            _get_existing_records_batch(client, table, keys[:mid], existing_map)
            _get_existing_records_batch(client, table, keys[mid:], existing_map)
        else:
            # 1件の場合は個別に取得を試みる
            try:
                response = client.table(table).select("key,created_dt").eq("key", keys[0]).execute()
                if response.data:
                    existing_map[response.data[0]["key"]] = response.data[0]
            except Exception:
                pass


def _get_existing_records(client, table: str, keys: list[str]) -> dict[str, dict]:
    """既存レコードをkeyで取得してマップ化。"""
    if not keys:
        return {}
    
    existing_map = {}
    # 重複を除去
    unique_keys = list(dict.fromkeys(keys))
    
    # バッチサイズごとに既存レコードを取得
    for i in range(0, len(unique_keys), EXISTING_RECORDS_BATCH_SIZE):
        chunk_keys = unique_keys[i : i + EXISTING_RECORDS_BATCH_SIZE]
        _get_existing_records_batch(client, table, chunk_keys, existing_map)
    
    return existing_map


def _upsert_batched(client, table: str, records: list[dict]) -> tuple[int, int]:
    """
    レコードをバッチでUPSERT処理。
    既存レコードはcreated_dtを保持し、updated_dtを更新。
    新規レコードはcreated_dtとupdated_dtを現在日時に設定。
    
    Returns:
        (更新件数, 新規登録件数) のタプル
    """
    now = datetime.now(timezone.utc)
    updated_count = 0
    inserted_count = 0
    
    for i in range(0, len(records), BATCH_SIZE):
        chunk = records[i : i + BATCH_SIZE]
        
        # バッチ内の全keyを取得
        keys = [rec.get("key") for rec in chunk if rec.get("key")]
        
        # 既存レコードを取得
        existing_map = _get_existing_records(client, table, keys)
        
        # 各レコードに日時と削除フラグを設定
        for rec in chunk:
            rec["delete_flg"] = 0
            key = rec.get("key")
            
            if key and key in existing_map:
                # 既存レコード: created_dtを保持、updated_dtを更新
                rec["created_dt"] = existing_map[key]["created_dt"]
                rec["updated_dt"] = now.isoformat()
                updated_count += 1
            else:
                # 新規レコード: created_dtとupdated_dtを現在日時に設定
                rec["created_dt"] = now.isoformat()
                rec["updated_dt"] = now.isoformat()
                inserted_count += 1
        
        # upsertで一括更新
        try:
            client.table(table).upsert(chunk).execute()
        except Exception as e:
            print(f"エラー: {table} のUPSERT処理中にエラー: {e}", file=sys.stderr)
            raise
    
    return (updated_count, inserted_count)


def main() -> int:
    load_dotenv()
    url = os.environ.get("SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not key:
        print("SUPABASE_URL と SUPABASE_SERVICE_KEY を .env に設定してください。", file=sys.stderr)
        return 1

    client = create_client(url, key)

    total_updated = 0
    total_inserted = 0
    error_count = 0

    for table, csv_path, int_cols, num_cols in LOAD_CONFIG:
        # ファイルの存在確認
        if not csv_path.exists():
            print(f"スキップ: {csv_path} が存在しません")
            continue
        
        try:
            int_s = set(int_cols)
            num_s = set(num_cols)
            records = _read_csv(csv_path, int_s, num_s)
            
            if not records:
                print(f"スキップ: {table} ({csv_path}) にデータ行がありません")
                continue
            
            # UPSERT処理
            updated, inserted = _upsert_batched(client, table, records)
            total_updated += updated
            total_inserted += inserted
            print(f"更新: {table} - 更新 {updated} 件, 新規登録 {inserted} 件")
            
        except Exception as e:
            print(f"エラー: {table} ({csv_path}) - {e}", file=sys.stderr)
            error_count += 1
            # エラーが発生しても次のテーブル処理を継続
            continue

    # サマリー表示
    print("\n" + "=" * 70)
    print("処理完了")
    print("=" * 70)
    print(f"更新件数: {total_updated} 件")
    print(f"新規登録件数: {total_inserted} 件")
    if error_count > 0:
        print(f"エラー発生テーブル数: {error_count}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
