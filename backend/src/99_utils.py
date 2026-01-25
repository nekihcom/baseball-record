"""
共通ユーティリティ関数
"""
import os
import csv
import re
import requests
from bs4 import BeautifulSoup
import importlib.util

# 定数ファイルをインポート
spec = importlib.util.spec_from_file_location("constants", os.path.join(os.path.dirname(__file__), "constants.py"))
constants = importlib.util.module_from_spec(spec)
spec.loader.exec_module(constants)


def get_html(url):
    """URLからHTMLを取得する"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        response.encoding = response.apparent_encoding
        return response.text
    except requests.RequestException as e:
        print(f"エラー: {url} の取得に失敗しました: {e}")
        return None


def extract_text(element, default=""):
    """要素からテキストを抽出する（要素がNoneの場合はデフォルト値を返す）"""
    if element is None:
        return default
    return element.get_text(strip=True)


def extract_date(soup):
    """日付を抽出する（yyyymmdd形式）"""
    date_elem = soup.select_one('.gameInfo01 .date')
    if date_elem is None:
        return ""
    
    date_text = date_elem.get_text(strip=True)
    
    # 日付をyyyymmdd形式に変換
    # 例: "2025/11/30(日)" -> "20251130"
    # 例: "2025/11/30" -> "20251130"
    date_match = re.search(r'(\d{4})/(\d{1,2})/(\d{1,2})', date_text)
    if date_match:
        year = date_match.group(1)
        month = date_match.group(2).zfill(2)
        day = date_match.group(3).zfill(2)
        return f"{year}{month}{day}"
    
    return ""


def extract_start_time(soup):
    """開始時刻を抽出する（「〜」は除去）"""
    time_elem = soup.select_one('.gameInfo01 .date .time')
    if time_elem is None:
        return ""
    
    time_text = time_elem.get_text(strip=True)
    # 「〜」を除去
    time_text = time_text.replace('〜', '')
    return time_text.strip()


def load_player_lookup(csv_path=None):
    """
    選手情報CSVファイルを読み込み、key -> player_name の辞書を返す。
    ファイルが存在しない・空の場合は空辞書を返す。
    
    Args:
        csv_path: CSVファイルのパス（デフォルトは定数ファイルから取得）
    
    CSVの形式:
    - key列がある場合: key列を直接使用
    - key列がない場合: team列とplayer_number列からkeyを生成
    """
    if csv_path is None:
        csv_path = constants.PLAYERS_INFO_CSV_PATH
    lookup = {}
    if not os.path.exists(csv_path):
        return lookup
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row = {k.strip(): (v or '').strip() for k, v in row.items()}
            
            # key列がある場合はそれを使用
            key = row.get('key', '')
            if not key:
                # key列がない場合はteamとplayer_numberから生成
                team = row.get('team', '')
                pnum = row.get('player_number', '')
                if team and pnum:
                    key = f"{team}_{pnum}"
            
            pname = row.get('player_name', '')
            if key:
                lookup[key] = pname
    
    return lookup


def load_player_lookup_by_nickname(csv_path=None):
    """
    選手情報CSVファイルを読み込み、${team}_${nickname} -> player_name の辞書を返す。
    ファイルが存在しない・空の場合は空辞書を返す。
    
    Args:
        csv_path: CSVファイルのパス（デフォルトは定数ファイルから取得）
    
    Returns:
        dict: ${team}_${nickname} をキー、player_name を値とする辞書
    """
    if csv_path is None:
        csv_path = constants.PLAYERS_INFO_CSV_PATH
    lookup = {}
    if not os.path.exists(csv_path):
        return lookup
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row = {k.strip(): (v or '').strip() for k, v in row.items()}
            
            team = row.get('team', '')
            nickname = row.get('nickname', '')
            player_name = row.get('player_name', '')
            
            if team and nickname:
                key = f"{team}_{nickname}"
                lookup[key] = player_name
    
    return lookup


def load_teams_info(csv_path=None):
    """
    チーム情報CSVファイルを読み込み、key -> team_name の辞書を返す。
    ファイルが存在しない・空の場合は空辞書を返す。
    
    Args:
        csv_path: CSVファイルのパス（デフォルトは定数ファイルから取得）
    
    Returns:
        dict: key をキー、team_name を値とする辞書
    """
    if csv_path is None:
        csv_path = constants.TEAMS_INFO_CSV_PATH
    lookup = {}
    if not os.path.exists(csv_path):
        return lookup
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row = {k.strip(): (v or '').strip() for k, v in row.items()}
            
            key = row.get('key', '')
            team_name = row.get('team_name', '')
            
            if key and team_name:
                lookup[key] = team_name
    
    return lookup


def parse_command_line_args(script_name, supports_test_mode=True):
    """
    コマンドライン引数を解析する
    
    Args:
        script_name: スクリプト名（使用方法の表示に使用）
        supports_test_mode: --testオプションをサポートするかどうか
    
    Returns:
        (team_names, test_mode) のタプル
    """
    import sys
    
    args = sys.argv[1:]
    
    # --testオプションのチェック
    test_mode = False
    if supports_test_mode:
        test_mode = '--test' in args
        if test_mode:
            args.remove('--test')
    
    # チーム名を取得（複数対応）
    if len(args) < 1:
        print("エラー: チーム名を指定してください")
        test_help = " [--test]" if supports_test_mode else ""
        print(f"使用方法: python {script_name} <チーム名> [<チーム名> ...]{test_help}")
        print(f"例: python {script_name} orcas")
        print(f"例: python {script_name} orcas swallows-fan")
        if supports_test_mode:
            print(f"例（テストモード）: python {script_name} orcas swallows-fan marines --test")
        sys.exit(1)
    
    team_names = args
    
    # チーム名のバリデーション（英数字のみ）
    for team_name in team_names:
        if not team_name.replace('_', '').replace('-', '').isalnum():
            print(f"エラー: チーム名「{team_name}」は英数字のみで指定してください")
            sys.exit(1)
    
    return team_names, test_mode


def prepare_csv_filename(base_filename, output_dir='output'):
    """
    CSVファイル名を準備する（日付なしのファイル名を返す）
    
    既に日付なしのファイル名が存在する場合、そのファイルを
    実行日付の「_yyyymmdd」をつけたファイル名にリネームする。
    
    Args:
        base_filename: 日付なしのベースファイル名（例：'01_game_info.csv'）
        output_dir: 出力ディレクトリ
    
    Returns:
        日付なしのファイル名（例：'01_game_info.csv'）
    """
    from datetime import datetime
    
    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)
    
    # 日付なしのファイルパス
    base_filepath = os.path.join(output_dir, base_filename)
    
    # 日付なしのファイルが存在する場合、日付付きにリネーム
    if os.path.exists(base_filepath):
        today = datetime.now().strftime('%Y%m%d')
        # ファイル名から拡張子を分離
        name, ext = os.path.splitext(base_filename)
        dated_filename = f"{name}_{today}{ext}"
        dated_filepath = os.path.join(output_dir, dated_filename)
        
        # リネーム
        os.rename(base_filepath, dated_filepath)
        print(f"既存のファイルをリネームしました: {base_filename} -> {dated_filename}")
    
    return base_filename
