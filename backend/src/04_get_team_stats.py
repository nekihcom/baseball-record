"""
チーム成績をスクレイピングしてCSVに出力するスクリプト
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
parse_command_line_args = utils.parse_command_line_args
prepare_csv_filename = utils.prepare_csv_filename


def scrape_team_stats(team_name):
    """チーム成績ページから情報を抽出する"""
    url = f"https://teams.one/teams/{team_name}/stats"
    print(f"チーム成績を取得中: {url}")
    
    html = get_html(url)
    if html is None:
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # div.teamStatsDetailContainer > table.stats_battingがなければ処理終了
    table = soup.select_one('div.teamStatsDetailContainer > table.stats_batting')
    if table is None:
        print(f"  {team_name}: div.teamStatsDetailContainer > table.stats_battingが見つかりません。処理を終了します。")
        return []
    
    # tbodyを取得
    tbody = table.find('tbody')
    if tbody is None:
        print(f"  {team_name}: tbodyが見つかりません。処理を終了します。")
        return []
    
    # tbody > trの各行を取得（最後のtrは除外）
    rows = tbody.find_all('tr')
    if not rows:
        print(f"  {team_name}: データ行が見つかりません。")
        return []
    
    # 最後のtrを除外
    rows = rows[:-1]
    
    result = []
    for tr in rows:
        tds = tr.find_all('td')
        if len(tds) < 12:
            continue
        
        # 各フィールドを取得
        year = extract_text(tds[0]) if len(tds) > 0 else ""
        games = extract_text(tds[1]) if len(tds) > 1 else ""
        wins = extract_text(tds[2]) if len(tds) > 2 else ""
        losses = extract_text(tds[3]) if len(tds) > 3 else ""
        draws = extract_text(tds[4]) if len(tds) > 4 else ""
        winning_percentage = extract_text(tds[5]) if len(tds) > 5 else ""
        runs_scored = extract_text(tds[6]) if len(tds) > 6 else ""
        runs_allowed = extract_text(tds[7]) if len(tds) > 7 else ""
        batting_average = extract_text(tds[8]) if len(tds) > 8 else ""
        home_runs = extract_text(tds[9]) if len(tds) > 9 else ""
        stolen_bases = extract_text(tds[10]) if len(tds) > 10 else ""
        
        # earned_run_average: 12番目のtdからhidden inputの値を使って計算
        earned_run_average = ""
        if len(tds) > 11:
            era_td = tds[11]
            # hidden inputから値を取得
            earned_run_input = era_td.find('input', {'name': lambda x: x and x.startswith('earned_run_')})
            inning_input = era_td.find('input', {'name': lambda x: x and x.startswith('inning_')})
            part_of_inning_input = era_td.find('input', {'name': lambda x: x and x.startswith('part_of_inning_')})
            
            if earned_run_input and inning_input and part_of_inning_input:
                try:
                    earned_run = float(earned_run_input.get('value', 0))
                    inning = float(inning_input.get('value', 0))
                    part_of_inning = float(part_of_inning_input.get('value', 0))
                    
                    # 投球回数を計算（イニング数 + アウト数/3）
                    total_innings = inning + (part_of_inning / 3)
                    
                    # ERAを計算（投球回数が0の場合は0）
                    if total_innings > 0:
                        era = (earned_run * 7) / total_innings
                        earned_run_average = f"{era:.2f}"
                    else:
                        earned_run_average = "0.00"
                except (ValueError, TypeError):
                    earned_run_average = ""
        
        # key: ${team}_${year}
        row_key = f"{team_name}_{year}"

        row = {
            'key': row_key,
            'team': team_name,
            'year': year,
            'games': games,
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'winning_percentage': winning_percentage,
            'runs_scored': runs_scored,
            'runs_allowed': runs_allowed,
            'batting_average': batting_average,
            'home_runs': home_runs,
            'stolen_bases': stolen_bases,
            'earned_run_average': earned_run_average,
        }
        result.append(row)
    
    return result


def save_to_csv(all_rows, output_dir='output'):
    """取得したチーム成績をCSVに保存する"""
    if not all_rows:
        print("保存するデータがありません。")
        return None
    
    # ファイル名を準備（日付なし）
    filename = prepare_csv_filename("04_team_stats.csv", output_dir)
    filepath = os.path.join(output_dir, filename)
    
    # CSVに書き込み（keyを先頭列）
    fieldnames = [
        'key', 'team', 'year', 'games', 'wins', 'losses', 'draws',
        'winning_percentage', 'runs_scored', 'runs_allowed',
        'batting_average', 'home_runs', 'stolen_bases', 'earned_run_average'
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
    team_names, _ = parse_command_line_args('src/04_get_team_stats.py', supports_test_mode=False)
    
    print("=" * 50)
    print("チーム成績のスクレイピングを開始します")
    print(f"チーム: {', '.join(team_names)}")
    print("=" * 50)
    
    # 全チームの成績データを取得
    all_rows = []
    for team_name in team_names:
        print(f"\n--- {team_name} のデータを取得中 ---")
        rows = scrape_team_stats(team_name)
        if rows:
            all_rows.extend(rows)
            print(f"{team_name}: {len(rows)}件のチーム成績データを取得しました")
        else:
            print(f"{team_name}: チーム成績データが取得できませんでした")
        
        # サーバーに負荷をかけないように少し待機
        time.sleep(1)
    
    if not all_rows:
        print("\nチーム成績データが取得できませんでした。")
        return
    
    print(f"\n合計取得したチーム成績行数: {len(all_rows)}件")
    
    # CSVに保存
    filepath = save_to_csv(all_rows)
    
    print("\n" + "=" * 50)
    print("処理が完了しました！")
    if filepath:
        print(f"出力ファイル: {filepath}")
    print("=" * 50)


if __name__ == "__main__":
    main()
