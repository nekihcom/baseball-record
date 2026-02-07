"""
投手成績一覧をスクレイピングしてCSVに出力するスクリプト
"""
import sys
import os
import csv
from datetime import datetime
import warnings

# urllib3のOpenSSL警告を抑制
# macOSのLibreSSL環境でurllib3 v2がOpenSSL警告を出すため
os.environ['PYTHONWARNINGS'] = 'ignore::UserWarning:urllib3'
warnings.filterwarnings('ignore', category=UserWarning, module='urllib3')

from bs4 import BeautifulSoup
import time
import importlib.util

# 数字で始まるモジュール名をインポートするため、importlibを使用
spec = importlib.util.spec_from_file_location("utils", os.path.join(os.path.dirname(__file__), "99_utils.py"))
utils = importlib.util.module_from_spec(spec)
spec.loader.exec_module(utils)
get_html = utils.get_html
extract_text = utils.extract_text
load_player_lookup = utils.load_player_lookup
prepare_csv_filename = utils.prepare_csv_filename
parse_command_line_args = utils.parse_command_line_args


def convert_innings_pitched_to_decimal(innings_pitched):
    """
    innings_pitched（例: "7回1/3"）を小数に変換する
    
    Args:
        innings_pitched: 投球回の文字列（例: "7回1/3", "5回0/3", "3回2/3"）
    
    Returns:
        float: 投球回の小数値（例: 7.33333, 5.0, 3.66667）
    """
    if not innings_pitched or not isinstance(innings_pitched, str):
        return None
    
    # 「回」で分割
    parts = innings_pitched.split('回')
    if len(parts) < 2:
        return None
    
    innings_pitched_former = parts[0].strip()
    innings_pitched_latter = parts[1].strip()
    
    try:
        former = float(innings_pitched_former)
    except ValueError:
        return None
    
    # 後半部分の処理
    if innings_pitched_latter == "0/3":
        return former
    elif innings_pitched_latter == "1/3":
        return former + 0.33333
    elif innings_pitched_latter == "2/3":
        return former + 0.66667
    else:
        # 後半部分がない場合（例: "7回"のみ）
        return former


def calculate_strikeout_rate(strikeouts, innings_pitched):
    """
    奪三振率を計算する
    
    Args:
        strikeouts: 奪三振数（文字列または数値）
        innings_pitched: 投球回（文字列、例: "7回1/3"）
    
    Returns:
        str: 奪三振率（計算できない場合は「-」）
    """
    # strikeoutsを数値に変換
    try:
        strikeouts_num = float(strikeouts) if strikeouts else 0
    except (ValueError, TypeError):
        return "-"
    
    # innings_pitchedを小数に変換
    inning = convert_innings_pitched_to_decimal(innings_pitched)
    if inning is None or inning == 0:
        return "-"
    
    # 奪三振率 = (strikeouts * 7) / INNING
    strikeout_rate = (strikeouts_num * 7) / inning
    
    # 小数点以下3桁まで表示
    return f"{strikeout_rate:.3f}"


def calculate_k_bb(strikeouts, walks_allowed):
    """
    K/BBを計算する
    
    Args:
        strikeouts: 奪三振数（文字列または数値）
        walks_allowed: 与四球数（文字列または数値）
    
    Returns:
        str: K/BB（計算できない場合は「-」）
    """
    # strikeoutsを数値に変換
    try:
        strikeouts_num = float(strikeouts) if strikeouts else 0
    except (ValueError, TypeError):
        return "-"
    
    # walks_allowedを数値に変換
    try:
        walks_allowed_num = float(walks_allowed) if walks_allowed else 0
    except (ValueError, TypeError):
        return "-"
    
    # 与四球が0の場合は計算できない
    if walks_allowed_num == 0:
        return "-"
    
    # K/BB = strikeouts / walks_allowed
    k_bb = strikeouts_num / walks_allowed_num
    
    # 小数点以下3桁まで表示
    return f"{k_bb:.3f}"


def calculate_whip(hits_allowed, walks_allowed, innings_pitched):
    """
    WHIPを計算する
    
    Args:
        hits_allowed: 被安打数（文字列または数値）
        walks_allowed: 与四球数（文字列または数値）
        innings_pitched: 投球回（文字列、例: "7回1/3"）
    
    Returns:
        str: WHIP（計算できない場合は「-」）
    """
    # hits_allowedを数値に変換
    try:
        hits_allowed_num = float(hits_allowed) if hits_allowed else 0
    except (ValueError, TypeError):
        return "-"
    
    # walks_allowedを数値に変換
    try:
        walks_allowed_num = float(walks_allowed) if walks_allowed else 0
    except (ValueError, TypeError):
        return "-"
    
    # innings_pitchedを小数に変換
    inning = convert_innings_pitched_to_decimal(innings_pitched)
    if inning is None or inning == 0:
        return "-"
    
    # WHIP = (hits_allowed + walks_allowed) / INNING
    whip = (hits_allowed_num + walks_allowed_num) / inning
    
    # 小数点以下3桁まで表示
    return f"{whip:.3f}"


def scrape_pitcher_stats(team_name, year, player_lookup=None):
    """投手成績ページから情報を抽出する"""
    if player_lookup is None:
        player_lookup = {}
    
    # url = f"https://teams.one/teams/{team_name}/stats/pitchers_table?search_result%5Bgame_date%5D={year}&search_result%5Bgame_type%5D=&search_result%5Bopponent_team_name%5D=&search_result%5Btournament_name%5D=&search_result%5Bis_walk_game%5D=&search_result%5Bunreached%5D=true"
    url = f"https://teams.one/teams/{team_name}/stats/pitchers_table?search_result%5Bgame_date%5D={year}&search_result%5Bgame_type%5D=&search_result%5Bopponent_team_name%5D=&search_result%5Btournament_name%5D=&search_result%5Bis_walk_game%5D=&search_result%5Bunreached%5D=&search_result%5Bunreached%5D=true"
    print(f"  {year}年の投手成績を取得中: {url}")
    
    html = get_html(url)
    if html is None:
        print(f"  {team_name} ({year}年): HTMLが取得できませんでした。")
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # div.pitchingStatsDetailContainer > div.pitchingDetailContainer.longTableContainer.lessData.stats_all_player_tableがなければ処理終了
    # 直接の子要素（>）ではなく、子孫要素（スペース）で検索する
    container = soup.select_one('div.pitchingStatsDetailContainer div.pitchingDetailContainer.longTableContainer.lessData.stats_all_player_table')
    if container is None:
        # より柔軟なセレクタで試す
        container = soup.select_one('div.pitchingStatsDetailContainer div.pitchingDetailContainer.stats_all_player_table')
        if container is None:
            container = soup.select_one('div.pitchingStatsDetailContainer div.stats_all_player_table')
            if container is None:
                container = soup.select_one('div.pitchingDetailContainer.stats_all_player_table')
                if container is None:
                    container = soup.select_one('div.stats_all_player_table')
        
        if container is None:
            print(f"  {team_name} ({year}年): div.pitchingStatsDetailContainer > div.pitchingDetailContainer.longTableContainer.lessData.stats_all_player_tableが見つかりません。処理を終了します。")
            return []
    
    # div.inner_stats_all_player_table > table > tbody > tr
    inner_table = container.select_one('div.inner_stats_all_player_table > table')
    if inner_table is None:
        print(f"  {team_name} ({year}年): div.inner_stats_all_player_table > tableが見つかりません。")
        return []
    
    tbody = inner_table.find('tbody')
    if tbody is None:
        print(f"  {team_name} ({year}年): tbodyが見つかりません。")
        return []
    
    rows = tbody.find_all('tr')
    if not rows:
        print(f"  {team_name} ({year}年): データ行が見つかりません。")
        return []
    
    result = []
    for tr in rows:
        tds = tr.find_all('td')
        # 投手成績テーブルには21個のtd要素がある（playerName + 20個の統計項目）
        # playerNameが1番目、その次が2番目、games_playedが3番目（インデックス2）
        if len(tds) < 21:
            continue
        
        # player_number: td.playerNameの値を半角スペースで分割した時のindex=0の値
        player_name_td = tr.find('td', class_='playerName')
        if player_name_td is None:
            continue
        
        player_name_text = extract_text(player_name_td)
        player_number = player_name_text.split()[0] if player_name_text else ""
        
        # player: ${team}_${player_number}を01_players_info.csvのkeyと突合した時のplayer_name
        lookup_key = f"{team_name}_{player_number}"
        player = player_lookup.get(lookup_key, "")

        # key: ${team}_${year}_${player_number}_${player}
        row_key = f"{team_name}_{year}_{player_number}_{player}"

        # 各フィールドを取得（要件に従って、3番目のtdから取得）
        # playerNameが1番目（インデックス0）、次のtdが2番目（インデックス1）、games_playedが3番目（インデックス2）
        games_played = extract_text(tds[1]) if len(tds) > 1 else ""  # 3番目のtd
        wins = extract_text(tds[2]) if len(tds) > 2 else ""  # 4番目のtd
        holds = extract_text(tds[3]) if len(tds) > 3 else ""  # 5番目のtd
        saves = extract_text(tds[4]) if len(tds) > 4 else ""  # 6番目のtd
        losses = extract_text(tds[5]) if len(tds) > 5 else ""  # 7番目のtd
        win_percentage = extract_text(tds[6]) if len(tds) > 6 else ""  # 8番目のtd
        era = extract_text(tds[7]) if len(tds) > 7 else ""  # 9番目のtd
        innings_pitched = extract_text(tds[8]) if len(tds) > 8 else ""  # 10番目のtd
        pitches_thrown = extract_text(tds[9]) if len(tds) > 9 else ""  # 11番目のtd
        runs_allowed = extract_text(tds[10]) if len(tds) > 10 else ""  # 12番目のtd
        earned_runs_allowed = extract_text(tds[11]) if len(tds) > 11 else ""  # 13番目のtd
        complete_games = extract_text(tds[12]) if len(tds) > 12 else ""  # 14番目のtd
        shutouts = extract_text(tds[13]) if len(tds) > 13 else ""  # 15番目のtd
        hits_allowed = extract_text(tds[14]) if len(tds) > 14 else ""  # 16番目のtd
        home_runs_allowed = extract_text(tds[15]) if len(tds) > 15 else ""  # 17番目のtd
        strikeouts = extract_text(tds[16]) if len(tds) > 16 else ""  # 18番目のtd
        walks_allowed = extract_text(tds[17]) if len(tds) > 17 else ""  # 19番目のtd
        hit_batters = extract_text(tds[18]) if len(tds) > 18 else ""  # 20番目のtd
        balks = extract_text(tds[19]) if len(tds) > 19 else ""  # 21番目のtd
        wild_pitches = extract_text(tds[20]) if len(tds) > 20 else ""  # 22番目のtd（実際のHTMLでは21番目のtdと同じ）
        
        # 奪三振率を計算
        strikeout_rate = calculate_strikeout_rate(strikeouts, innings_pitched)
        
        # K/BBを計算
        k_bb = calculate_k_bb(strikeouts, walks_allowed)
        
        # WHIPを計算
        whip = calculate_whip(hits_allowed, walks_allowed, innings_pitched)
        
        row = {
            'key': row_key,
            'team': team_name,
            'year': str(year),
            'player_number': player_number,
            'player': player,
            'games_played': games_played,
            'wins': wins,
            'holds': holds,
            'saves': saves,
            'losses': losses,
            'win_percentage': win_percentage,
            'era': era,
            'innings_pitched': innings_pitched,
            'pitches_thrown': pitches_thrown,
            'runs_allowed': runs_allowed,
            'earned_runs_allowed': earned_runs_allowed,
            'complete_games': complete_games,
            'shutouts': shutouts,
            'hits_allowed': hits_allowed,
            'home_runs_allowed': home_runs_allowed,
            'strikeouts': strikeouts,
            'strikeout_rate': strikeout_rate,
            'walks_allowed': walks_allowed,
            'hit_batters': hit_batters,
            'balks': balks,
            'wild_pitches': wild_pitches,
            'k_bb': k_bb,
            'whip': whip,
        }
        result.append(row)
    
    return result


def scrape_all_years_pitcher_stats(team_name, test_mode=False, player_lookup=None):
    """全年度の投手成績を取得する"""
    if player_lookup is None:
        player_lookup = {}
    
    # 実行日時の年から開始
    current_year = datetime.now().year
    year = current_year
    
    all_rows = []
    
    while year >= 2016:
        rows = scrape_pitcher_stats(team_name, year, player_lookup)
        if rows:
            all_rows.extend(rows)
            print(f"  {team_name} ({year}年): {len(rows)}件の投手成績データを取得しました")
        else:
            print(f"  {team_name} ({year}年): 投手成績データが取得できませんでした")
        
        # テストモードの場合は1年分だけ取得して終了
        if test_mode:
            print(f"  テストモード: {year}年のデータのみ取得しました。")
            break
        
        # サーバーに負荷をかけないように少し待機
        time.sleep(1)
        
        # 年を1つ減らす
        year -= 1
    
    return all_rows


def save_to_csv(all_rows, output_dir='output'):
    """取得した投手成績をCSVに保存する"""
    if not all_rows:
        print("保存するデータがありません。")
        return None
    
    # ファイル名を準備（日付なし）
    filename = prepare_csv_filename("06_pitcher_stats.csv", output_dir)
    filepath = os.path.join(output_dir, filename)
    
    # CSVに書き込み（keyを先頭列）
    fieldnames = [
        'key', 'team', 'year', 'player_number', 'player',
        'games_played', 'wins', 'holds', 'saves', 'losses', 'win_percentage',
        'era', 'innings_pitched', 'pitches_thrown',
        'runs_allowed', 'earned_runs_allowed',
        'complete_games', 'shutouts',
        'hits_allowed', 'home_runs_allowed',
        'strikeouts', 'strikeout_rate', 'walks_allowed', 'hit_batters',
        'balks', 'wild_pitches', 'k_bb', 'whip'
    ]
    
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)
    
    print(f"\nCSVファイルを保存しました: {filepath}")
    return filepath


def main():
    """メイン処理"""
    # コマンドライン引数を解析
    team_names, test_mode = parse_command_line_args('src/06_get_pitcher_stats.py', supports_test_mode=True)
    
    print("=" * 50)
    print("投手成績一覧のスクレイピングを開始します")
    print(f"チーム: {', '.join(team_names)}")
    if test_mode:
        print("モード: テストモード（各チームについて1年分のみ取得）")
    print("=" * 50)
    
    # プレイヤー情報を読み込む
    player_lookup = load_player_lookup()
    
    # 全チームの投手成績データを取得
    all_rows = []
    for team_name in team_names:
        print(f"\n--- {team_name} のデータを取得中 ---")
        rows = scrape_all_years_pitcher_stats(team_name, test_mode=test_mode, player_lookup=player_lookup)
        if rows:
            all_rows.extend(rows)
            print(f"{team_name}: 合計{len(rows)}件の投手成績データを取得しました")
        else:
            print(f"{team_name}: 投手成績データが取得できませんでした")
        
        # サーバーに負荷をかけないように少し待機
        time.sleep(1)
    
    if not all_rows:
        print("\n投手成績データが取得できませんでした。")
        return
    
    print(f"\n合計取得した投手成績行数: {len(all_rows)}件")
    
    # CSVに保存
    filepath = save_to_csv(all_rows)
    
    print("\n" + "=" * 50)
    print("処理が完了しました！")
    if filepath:
        print(f"出力ファイル: {filepath}")
    print("=" * 50)


if __name__ == "__main__":
    main()
