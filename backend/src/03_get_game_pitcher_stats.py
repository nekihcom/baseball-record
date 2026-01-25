"""
試合別成績ページの投手成績をスクレイピングしてCSVに出力するスクリプト
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


def calculate_inning(cell_value, translation_value):
    """
    イニング数を計算する
    - cell_value: tdの値（①）
    - translation_value: span.translation_missingの値（②）
    - ②が「1」の場合、0.3を①に足す
    - ②が「2」の場合、0.6を①に足す
    - ①が「0」の場合は何もしない
    """
    try:
        base_value = float(cell_value) if cell_value else 0.0
    except (ValueError, TypeError):
        return cell_value  # 数値に変換できない場合は元の値を返す
    
    # ①が「0」の場合は何もしない
    if base_value == 0.0:
        return cell_value
    
    # ②の値を確認
    if translation_value == "1":
        result = base_value + 0.3
        # 整数部が変わらない場合は .0 を付ける（例: 5.3）
        return f"{result:.1f}" if result != int(result) else f"{int(result)}.{3}"
    elif translation_value == "2":
        result = base_value + 0.6
        return f"{result:.1f}" if result != int(result) else f"{int(result)}.{6}"
    else:
        # translation_valueがない、または想定外の値の場合は元の値
        return cell_value


def scrape_game_pitcher_stats(url, team_name, player_lookup=None):
    """
    試合別成績ページから投手成績を抽出する。
    1試合につき、投手ごとの行（辞書のリスト）を返す。
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

    # table.stats_pitching.table > tbody > tr
    table = soup.select_one('table.stats_pitching.table')
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
            """i は 1-indexed（1番目〜17番目）。use_a=True のときは a タグのテキストを使用。"""
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

        # inningの計算（特殊処理）
        inning_cell = tds[3] if len(tds) > 3 else None
        inning_base = ""
        translation_value = ""
        if inning_cell:
            inning_base = inning_cell.get_text(strip=True)
            translation_span = inning_cell.find('span', class_='translation_missing')
            if translation_span:
                translation_value = translation_span.get_text(strip=True)
        inning = calculate_inning(inning_base, translation_value)

        row = {
            'key': row_key,
            'team': team,
            'date': date,
            'start_time': start_time,
            'player_number': pnum,
            'player': player,
            'result': cell(3),
            'inning': inning,
            'pitches': cell(5),
            'runs_allowed': cell(6),
            'earned_runs': cell(7),
            'complete_game': cell(8),
            'shotout': cell(9),
            'hits_allowed': cell(10),
            'hr_allowed': cell(11),
            'strikeouts': cell(12),
            'walks_allowed': cell(13),
            'hit_batsmen': cell(14),
            'balks': cell(15),
            'wild_pitches': cell(16),
            'order': cell(17),
        }
        result.append(row)

    return result


def scrape_all_games_pitcher_stats(team_name, test_mode=False, player_lookup=None):
    """全ページから試合別成績へのリンクをたどり、投手成績を取得する"""
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
            rows = scrape_game_pitcher_stats(href, team_name, player_lookup)
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
    """投手成績をCSVに保存する"""
    if not rows:
        print("保存するデータがありません。")
        return None

    # ファイル名を準備（日付なし）
    filename = prepare_csv_filename("03_game_pitcher_stats.csv", output_dir)
    filepath = os.path.join(output_dir, filename)

    fieldnames = [
        'key', 'team', 'date', 'start_time',
        'player_number', 'player', 'result', 'inning',
        'pitches', 'runs_allowed', 'earned_runs',
        'complete_game', 'shotout', 'hits_allowed', 'hr_allowed',
        'strikeouts', 'walks_allowed', 'hit_batsmen',
        'balks', 'wild_pitches', 'order'
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
    team_names, test_mode = parse_command_line_args('src/03_get_game_pitcher_stats.py', supports_test_mode=True)

    print("=" * 50)
    print("試合別投手成績のスクレイピングを開始します")
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
        rows = scrape_all_games_pitcher_stats(team_name, test_mode=test_mode, player_lookup=player_lookup)
        if rows:
            all_rows.extend(rows)
            print(f"{team_name}: {len(rows)}件の投手成績データを取得しました")
        else:
            print(f"{team_name}: 投手成績データが取得できませんでした")

    if not all_rows:
        print("\n投手成績データが取得できませんでした。")
        return

    print(f"\n合計取得した投手成績行数: {len(all_rows)}件")

    filepath = save_to_csv(all_rows)

    print("\n" + "=" * 50)
    print("処理が完了しました！")
    if filepath:
        print(f"出力ファイル: {filepath}")
    print("=" * 50)


if __name__ == "__main__":
    main()
