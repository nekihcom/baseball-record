"""
打者成績一覧をスクレイピングしてCSVに出力するスクリプト
"""
import sys
import os
import csv
import importlib.util
from datetime import datetime
from bs4 import BeautifulSoup
import time

# 数字で始まるモジュール名をインポートするため、importlibを使用
spec = importlib.util.spec_from_file_location("utils", os.path.join(os.path.dirname(__file__), "99_utils.py"))
utils = importlib.util.module_from_spec(spec)
spec.loader.exec_module(utils)
get_html = utils.get_html
extract_text = utils.extract_text
load_player_lookup = utils.load_player_lookup
parse_command_line_args = utils.parse_command_line_args
prepare_csv_filename = utils.prepare_csv_filename


def scrape_hitter_stats(team_name, year, player_lookup=None):
    """打者成績ページから情報を抽出する"""
    if player_lookup is None:
        player_lookup = {}
    
    url = f"https://teams.one/teams/{team_name}/stats/batters_table?search_result%5Bgame_date%5D={year}&search_result%5Bgame_type%5D=&search_result%5Bopponent_team_name%5D=&search_result%5Btournament_name%5D=&search_result%5Bis_walk_game%5D=&search_result%5Bunreached%5D="
    print(f"  {year}年の打者成績を取得中: {url}")
    
    html = get_html(url)
    if html is None:
        print(f"  {team_name} ({year}年): HTMLが取得できませんでした。")
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # div.battingStatsDetailContainer > div.battingDetailContainer.longTableContainer.lessData.stats_all_player_tableがなければ処理終了
    container = soup.select_one('div.battingStatsDetailContainer > div.battingDetailContainer.longTableContainer.lessData.stats_all_player_table')
    if container is None:
        # より柔軟なセレクタで試す
        container = soup.select_one('div.battingStatsDetailContainer div.stats_all_player_table')
        if container is None:
            container = soup.select_one('div.stats_all_player_table')
        
        if container is None:
            print(f"  {team_name} ({year}年): div.battingStatsDetailContainer > div.battingDetailContainer.longTableContainer.lessData.stats_all_player_tableが見つかりません。処理を終了します。")
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
        # 実際のHTMLには26個のtd要素があるため、26個以上で処理
        if len(tds) < 26:
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

        # 各フィールドを取得（要件に従って、2番目のtdから取得）
        # 2番目のtd = インデックス1, 3番目のtd = インデックス2, ...
        games_played = extract_text(tds[1]) if len(tds) > 1 else ""  # 2番目のtd
        batting_average = extract_text(tds[2]) if len(tds) > 2 else ""  # 3番目のtd
        plate_appearance = extract_text(tds[3]) if len(tds) > 3 else ""  # 4番目のtd
        at_bats = extract_text(tds[4]) if len(tds) > 4 else ""  # 5番目のtd
        hit = extract_text(tds[5]) if len(tds) > 5 else ""  # 6番目のtd
        hr = extract_text(tds[6]) if len(tds) > 6 else ""  # 7番目のtd
        rbi = extract_text(tds[7]) if len(tds) > 7 else ""  # 8番目のtd
        run = extract_text(tds[8]) if len(tds) > 8 else ""  # 9番目のtd
        stolen_base = extract_text(tds[9]) if len(tds) > 9 else ""  # 10番目のtd
        on_base_percentage = extract_text(tds[10]) if len(tds) > 10 else ""  # 11番目のtd
        slugging_percentage = extract_text(tds[11]) if len(tds) > 11 else ""  # 12番目のtd
        average_in_scoring = extract_text(tds[12]) if len(tds) > 12 else ""  # 13番目のtd
        ops = extract_text(tds[13]) if len(tds) > 13 else ""  # 14番目のtd
        double = extract_text(tds[14]) if len(tds) > 14 else ""  # 15番目のtd
        triple = extract_text(tds[15]) if len(tds) > 15 else ""  # 16番目のtd
        total_bases = extract_text(tds[16]) if len(tds) > 16 else ""  # 17番目のtd
        strikeout = extract_text(tds[17]) if len(tds) > 17 else ""  # 18番目のtd
        walk = extract_text(tds[18]) if len(tds) > 18 else ""  # 19番目のtd
        hit_by_pitch = extract_text(tds[19]) if len(tds) > 19 else ""  # 20番目のtd
        sacrifice_bunt = extract_text(tds[20]) if len(tds) > 20 else ""  # 21番目のtd
        sacrifice_fly = extract_text(tds[21]) if len(tds) > 21 else ""  # 22番目のtd
        double_play = extract_text(tds[22]) if len(tds) > 22 else ""  # 23番目のtd
        opponent_error = extract_text(tds[23]) if len(tds) > 23 else ""  # 24番目のtd
        own_error = extract_text(tds[24]) if len(tds) > 24 else ""  # 25番目のtd
        caught_stealing = extract_text(tds[25]) if len(tds) > 25 else ""  # 26番目のtd
        
        row = {
            'key': row_key,
            'team': team_name,
            'year': str(year),
            'player_number': player_number,
            'player': player,
            'games_played': games_played,
            'batting_average': batting_average,
            'plate_appearance': plate_appearance,
            'at_bats': at_bats,
            'hit': hit,
            'hr': hr,
            'rbi': rbi,
            'run': run,
            'stolen_base': stolen_base,
            'on_base_percentage': on_base_percentage,
            'slugging_percentage': slugging_percentage,
            'average_in_scoring': average_in_scoring,
            'ops': ops,
            'double': double,
            'triple': triple,
            'total_bases': total_bases,
            'strikeout': strikeout,
            'walk': walk,
            'hit_by_pitch': hit_by_pitch,
            'sacrifice_bunt': sacrifice_bunt,
            'sacrifice_fly': sacrifice_fly,
            'double_play': double_play,
            'opponent_error': opponent_error,
            'own_error': own_error,
            'caught_stealing': caught_stealing,
        }
        result.append(row)
    
    return result


def scrape_all_years_hitter_stats(team_name, test_mode=False, player_lookup=None):
    """全年度の打者成績を取得する"""
    if player_lookup is None:
        player_lookup = {}
    
    # 実行日時の年から開始
    current_year = datetime.now().year
    year = current_year
    
    all_rows = []
    
    while year >= 2016:
        rows = scrape_hitter_stats(team_name, year, player_lookup)
        if rows:
            all_rows.extend(rows)
            print(f"  {team_name} ({year}年): {len(rows)}件の打者成績データを取得しました")
        else:
            print(f"  {team_name} ({year}年): 打者成績データが取得できませんでした")
        
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
    """取得した打者成績をCSVに保存する"""
    if not all_rows:
        print("保存するデータがありません。")
        return None
    
    # ファイル名を準備（日付なし）
    filename = prepare_csv_filename("05_hitter_stats.csv", output_dir)
    filepath = os.path.join(output_dir, filename)
    
    # CSVに書き込み（keyを先頭列）
    fieldnames = [
        'key', 'team', 'year', 'player_number', 'player',
        'games_played', 'batting_average', 'plate_appearance', 'at_bats',
        'hit', 'hr', 'rbi', 'run', 'stolen_base',
        'on_base_percentage', 'slugging_percentage', 'average_in_scoring', 'ops',
        'double', 'triple', 'total_bases',
        'strikeout', 'walk', 'hit_by_pitch',
        'sacrifice_bunt', 'sacrifice_fly', 'double_play',
        'opponent_error', 'own_error', 'caught_stealing'
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
    team_names, test_mode = parse_command_line_args('src/05_get_hitter_stats.py', supports_test_mode=True)
    
    print("=" * 50)
    print("打者成績一覧のスクレイピングを開始します")
    print(f"チーム: {', '.join(team_names)}")
    if test_mode:
        print("モード: テストモード（各チームについて1年分のみ取得）")
    print("=" * 50)
    
    # プレイヤー情報を読み込む
    player_lookup = load_player_lookup()
    
    # 全チームの打者成績データを取得
    all_rows = []
    for team_name in team_names:
        print(f"\n--- {team_name} のデータを取得中 ---")
        rows = scrape_all_years_hitter_stats(team_name, test_mode=test_mode, player_lookup=player_lookup)
        if rows:
            all_rows.extend(rows)
            print(f"{team_name}: 合計{len(rows)}件の打者成績データを取得しました")
        else:
            print(f"{team_name}: 打者成績データが取得できませんでした")
        
        # サーバーに負荷をかけないように少し待機
        time.sleep(1)
    
    if not all_rows:
        print("\n打者成績データが取得できませんでした。")
        return
    
    print(f"\n合計取得した打者成績行数: {len(all_rows)}件")
    
    # CSVに保存
    filepath = save_to_csv(all_rows)
    
    print("\n" + "=" * 50)
    print("処理が完了しました！")
    if filepath:
        print(f"出力ファイル: {filepath}")
    print("=" * 50)


if __name__ == "__main__":
    main()
