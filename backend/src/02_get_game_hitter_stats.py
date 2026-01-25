"""
試合別成績ページの打者成績をスクレイピングしてCSVに出力するスクリプト
"""
import sys
import os
import csv
import importlib.util
from datetime import datetime
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import time

# 数字で始まるモジュール名をインポートするため、importlibを使用
spec = importlib.util.spec_from_file_location("utils", os.path.join(os.path.dirname(__file__), "99_utils.py"))
utils = importlib.util.module_from_spec(spec)
spec.loader.exec_module(utils)
get_html = utils.get_html
extract_date = utils.extract_date
extract_start_time = utils.extract_start_time
load_player_lookup = utils.load_player_lookup
parse_command_line_args = utils.parse_command_line_args
prepare_csv_filename = utils.prepare_csv_filename


def scrape_game_hitter_stats(url, team_name, player_lookup=None):
    """
    試合別成績ページから打者成績を抽出する。
    1試合につき、打者ごとの行（辞書のリスト）を返す。
    player: ${team}_${player_number} で 01_players_info.csv の key と突合し、
            一致すれば player_name、一致しなければ WEB 上の表示名を用いる。
    """
    if player_lookup is None:
        player_lookup = {}

    html = get_html(url)
    if html is None:
        return []

    soup = BeautifulSoup(html, 'html.parser')

    # team, date, start_time: 01_get_game_info.py と同じ
    team = team_name
    date = extract_date(soup)
    start_time = extract_start_time(soup)

    # table.stats_batting.table > tbody > tr
    table = soup.select_one('table.stats_batting.table')
    if table is None:
        return []

    tbody = table.find('tbody')
    if tbody is None:
        return []

    rows = tbody.find_all('tr')
    result = []

    for tr in rows:
        tds = tr.find_all('td')
        if len(tds) < 2:
            continue

        def cell(i, use_a=False):
            """i は 1-indexed（1番目〜25番目）。use_a=True のときは a タグのテキストを使用。"""
            idx = i - 1
            if idx < 0 or idx >= len(tds):
                return ""
            el = tds[idx]
            if use_a:
                a = el.find('a')
                return a.get_text(strip=True) if a else el.get_text(strip=True)
            return el.get_text(strip=True)

        pnum = cell(1)
        web_display = cell(2, use_a=True)
        lookup_key = f"{team}_{pnum}"
        player = player_lookup.get(lookup_key, web_display)

        # key: ${team}_${date}_${start_time}_${player_number}_${player}
        row_key = f"{team}_{date}_{start_time}_{pnum}_{player}"

        row = {
            'key': row_key,
            'team': team,
            'date': date,
            'start_time': start_time,
            'player_number': pnum,
            'player': player,
            'entry': cell(3),
            'order': cell(4),
            'position': cell(5),
            'plate_apperance': cell(6),
            'at_bat': cell(7),
            'hit': cell(8),
            'hr': cell(9),
            'rbi': cell(10),
            'run': cell(11),
            'stolen_base': cell(12),
            'double': cell(13),
            'triple': cell(14),
            'at_bat_in_scoring': cell(15),
            'hit_in_scoring': cell(16),
            'strikeout': cell(17),
            'walk': cell(18),
            'hit_by_pitch': cell(19),
            'sacrifice_bunt': cell(20),
            'sacrifice_fly': cell(21),
            'double_play': cell(22),
            'oponent_error': cell(23),
            'own_error': cell(24),
            'caught_stealing': cell(25),
        }
        result.append(row)

    return result


def scrape_all_games_hitter_stats(team_name, test_mode=False, player_lookup=None):
    """全ページから試合別成績へのリンクをたどり、打者成績を取得する"""
    if player_lookup is None:
        player_lookup = {}
    base_url = f"https://teams.one/teams/{team_name}/game"
    all_rows = []
    page = 1

    while True:
        url = f"{base_url}?page={page}"
        print(f"ページ {page} を取得中: {url}")

        html = get_html(url)
        if html is None:
            break

        soup = BeautifulSoup(html, 'html.parser')

        # ul.contentListがなければ処理終了
        content_list = soup.select_one('ul.contentList')
        if content_list is None:
            print(f"ページ {page}: ul.contentListが見つかりません。処理を終了します。")
            break

        # ul.contentList > li > a の href
        links = content_list.select('li > a')
        if not links:
            print(f"ページ {page}: リンクが見つかりません。処理を終了します。")
            break

        print(f"ページ {page}: {len(links)}件の試合別成績ページを取得します")

        for i, link in enumerate(links):
            href = link.get('href')
            if not href:
                continue

            if not href.startswith('http'):
                href = urljoin(base_url, href)

            print(f"  試合別成績を取得中: {href}")
            rows = scrape_game_hitter_stats(href, team_name, player_lookup)
            all_rows.extend(rows)

            # テストモード: page=1 の最初の1件の試合明細だけ処理して終了
            if test_mode:
                print("テストモード: page=1 の最初の1件の試合明細のみ処理しました。")
                return all_rows

            time.sleep(0.5)

        if test_mode:
            break

        page += 1
        time.sleep(1)

    return all_rows


def save_to_csv(rows, output_dir='output'):
    """打者成績をCSVに保存する"""
    if not rows:
        print("保存するデータがありません。")
        return None

    # ファイル名を準備（日付なし）
    filename = prepare_csv_filename("02_game_hitter_stats.csv", output_dir)
    filepath = os.path.join(output_dir, filename)

    fieldnames = [
        'key', 'team', 'date', 'start_time',
        'player_number', 'player', 'entry', 'order', 'position',
        'plate_apperance', 'at_bat', 'hit', 'hr', 'rbi', 'run',
        'stolen_base', 'double', 'triple',
        'at_bat_in_scoring', 'hit_in_scoring',
        'strikeout', 'walk', 'hit_by_pitch',
        'sacrifice_bunt', 'sacrifice_fly', 'double_play',
        'oponent_error', 'own_error', 'caught_stealing'
    ]

    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nCSVファイルを保存しました: {filepath}")
    return filepath


def main():
    """メイン処理"""
    # コマンドライン引数を解析
    team_names, test_mode = parse_command_line_args('src/02_get_game_hitter_stats.py', supports_test_mode=True)

    print("=" * 50)
    print("試合別打者成績のスクレイピングを開始します")
    print(f"チーム: {', '.join(team_names)}")
    if test_mode:
        if len(team_names) > 1:
            print("モード: テストモード（各チームについてpage=1の最初の1件の試合明細ずつ）")
        else:
            print("モード: テストモード（page=1 の最初の1件の試合明細のみ）")
    print("=" * 50)

    player_lookup = load_player_lookup()
    all_rows = []
    
    for team_name in team_names:
        print(f"\n--- {team_name} のデータを取得中 ---")
        rows = scrape_all_games_hitter_stats(team_name, test_mode=test_mode, player_lookup=player_lookup)
        if rows:
            all_rows.extend(rows)
            print(f"{team_name}: {len(rows)}件の打者成績データを取得しました")
        else:
            print(f"{team_name}: 打者成績データが取得できませんでした")

    if not all_rows:
        print("\n打者成績データが取得できませんでした。")
        return

    print(f"\n合計取得した打者成績行数: {len(all_rows)}件")

    filepath = save_to_csv(all_rows)

    print("\n" + "=" * 50)
    print("処理が完了しました！")
    if filepath:
        print(f"出力ファイル: {filepath}")
    print("=" * 50)


if __name__ == "__main__":
    main()
