"""
試合情報をスクレイピングしてCSVに出力するスクリプト
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
extract_text = utils.extract_text
extract_date = utils.extract_date
extract_start_time = utils.extract_start_time
prepare_csv_filename = utils.prepare_csv_filename
parse_command_line_args = utils.parse_command_line_args
load_player_lookup_by_nickname = utils.load_player_lookup_by_nickname
load_teams_info = utils.load_teams_info


def extract_inning_scores(soup, class_name):
    """イニングスコアを抽出する"""
    row = soup.select_one(f'tr.{class_name}')
    if row is None:
        return ""
    
    # 2番目以降の子要素を取得
    cells = row.find_all(['td', 'th'])[1:]  # 最初の要素をスキップ
    scores = []
    for cell in cells:
        score = cell.get_text(strip=True)
        if score:  # 空白でなければ結合
            scores.append(score)
    
    return "_".join(scores) if scores else ""


def extract_game_detail(soup, detail_class):
    """試合詳細情報を抽出する（勝ち投手、負け投手、ホームラン）"""
    detail_elem = soup.select_one(f'.gameDetailInfo01 > .{detail_class} > .nameBlock > a')
    if detail_elem is None:
        return ""
    return detail_elem.get_text(strip=True)


def convert_player_name(nickname, team_name, player_lookup):
    """
    ニックネームとチーム名からplayer_nameに変換する
    
    Args:
        nickname: 取得したニックネーム
        team_name: チーム名
        player_lookup: ${team}_${nickname} -> player_name の辞書
    
    Returns:
        player_name（一致した場合）、または元のnickname（一致しない場合）
    """
    if not nickname:
        return ""
    
    key = f"{team_name}_{nickname}"
    return player_lookup.get(key, nickname)


def scrape_game_detail(url, team_name, player_lookup=None, teams_info=None):
    """試合詳細ページから情報を抽出する"""
    html = get_html(url)
    if html is None:
        return None
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # type: .gameInfo01 .category > spanの値
    type_elem = soup.select_one('.gameInfo01 .category > span')
    game_type = extract_text(type_elem)
    
    # date: .gameInfo01 .dateの値(yyyymmdd形式)
    date = extract_date(soup)
    
    # start_time: .gameInfo01 .date .timeの値
    start_time = extract_start_time(soup)
    
    # place: p.place > aの値、なければp.placeの直接のテキスト
    place_elem = soup.select_one('p.place > a')
    place = extract_text(place_elem)
    if not place:
        place_elem = soup.select_one('p.place')
        place = extract_text(place_elem)
    
    # top_team: .gameInfo02 > .rowの最初の子要素(divタグ)の孫要素であるspanタグの値
    # bottom_team: .gameInfo02 > .rowの最後の子要素(divタグ)の孫要素であるspanタグの値
    row_elem = soup.select_one('.gameInfo02 > .row')
    top_team = ""
    bottom_team = ""
    if row_elem:
        # 直接の子要素（divタグ）を取得
        children = row_elem.find_all('div', recursive=False)
        
        if children:
            # 最初の子要素（divタグ）の孫要素であるspanタグを取得
            first_div = children[0]
            top_team_elem = first_div.find('span')
            top_team = extract_text(top_team_elem)
            
            # 最後の子要素（divタグ）の孫要素であるspanタグを取得
            if len(children) > 1:
                last_div = children[-1]
                bottom_team_elem = last_div.find('span')
                bottom_team = extract_text(bottom_team_elem)
    
    # top_team_score: p.scoreの最初の子要素の値
    score_elem = soup.select_one('p.score')
    top_team_score = ""
    bottom_team_score = ""
    if score_elem:
        score_children = score_elem.find_all(recursive=False)
        if len(score_children) >= 1:
            top_team_score = extract_text(score_children[0])
        if len(score_children) >= 2:
            bottom_team_score = extract_text(score_children[-1])
    
    # result: p.resultの値
    result_elem = soup.select_one('p.result')
    result = extract_text(result_elem)
    
    # top_inning_score_1〜9: table.scoreboard.table tbody .topInningの子要素であるtdタグから取得
    top_inning_row = soup.select_one('table.scoreboard.table tbody .topInning')
    top_inning_score_1 = ""
    top_inning_score_2 = ""
    top_inning_score_3 = ""
    top_inning_score_4 = ""
    top_inning_score_5 = ""
    top_inning_score_6 = ""
    top_inning_score_7 = ""
    top_inning_score_8 = ""
    top_inning_score_9 = ""
    
    if top_inning_row:
        # 子要素であるtdタグを取得
        td_elements = top_inning_row.find_all('td', recursive=False)
        # 2番目から10番目のtdタグを取得（インデックスは1から9）
        top_inning_score_1 = extract_text(td_elements[1]) if len(td_elements) > 1 else ""
        top_inning_score_2 = extract_text(td_elements[2]) if len(td_elements) > 2 else ""
        top_inning_score_3 = extract_text(td_elements[3]) if len(td_elements) > 3 else ""
        top_inning_score_4 = extract_text(td_elements[4]) if len(td_elements) > 4 else ""
        top_inning_score_5 = extract_text(td_elements[5]) if len(td_elements) > 5 else ""
        top_inning_score_6 = extract_text(td_elements[6]) if len(td_elements) > 6 else ""
        top_inning_score_7 = extract_text(td_elements[7]) if len(td_elements) > 7 else ""
        top_inning_score_8 = extract_text(td_elements[8]) if len(td_elements) > 8 else ""
        top_inning_score_9 = extract_text(td_elements[9]) if len(td_elements) > 9 else ""
    
    # bottom_inning_score_1〜9: table.scoreboard.table tbody .bottomInningの子要素であるtdタグから取得
    bottom_inning_row = soup.select_one('table.scoreboard.table tbody .bottomInning')
    bottom_inning_score_1 = ""
    bottom_inning_score_2 = ""
    bottom_inning_score_3 = ""
    bottom_inning_score_4 = ""
    bottom_inning_score_5 = ""
    bottom_inning_score_6 = ""
    bottom_inning_score_7 = ""
    bottom_inning_score_8 = ""
    bottom_inning_score_9 = ""
    
    if bottom_inning_row:
        # 子要素であるtdタグを取得
        td_elements = bottom_inning_row.find_all('td', recursive=False)
        # 2番目から10番目のtdタグを取得（インデックスは1から9）
        bottom_inning_score_1 = extract_text(td_elements[1]) if len(td_elements) > 1 else ""
        bottom_inning_score_2 = extract_text(td_elements[2]) if len(td_elements) > 2 else ""
        bottom_inning_score_3 = extract_text(td_elements[3]) if len(td_elements) > 3 else ""
        bottom_inning_score_4 = extract_text(td_elements[4]) if len(td_elements) > 4 else ""
        bottom_inning_score_5 = extract_text(td_elements[5]) if len(td_elements) > 5 else ""
        bottom_inning_score_6 = extract_text(td_elements[6]) if len(td_elements) > 6 else ""
        bottom_inning_score_7 = extract_text(td_elements[7]) if len(td_elements) > 7 else ""
        bottom_inning_score_8 = extract_text(td_elements[8]) if len(td_elements) > 8 else ""
        bottom_inning_score_9 = extract_text(td_elements[9]) if len(td_elements) > 9 else ""
    
    # win_pitcher: .gameDetailInfo01 > .win > .nameBlock > aの値
    win_pitcher_nickname = extract_game_detail(soup, 'win')
    win_pitcher = convert_player_name(win_pitcher_nickname, team_name, player_lookup) if player_lookup else win_pitcher_nickname
    
    # lose_pitcher: .gameDetailInfo01 > .lose > .nameBlock > aの値
    lose_pitcher_nickname = extract_game_detail(soup, 'lose')
    lose_pitcher = convert_player_name(lose_pitcher_nickname, team_name, player_lookup) if player_lookup else lose_pitcher_nickname
    
    # save_pitcher: .gameDetailInfo01 > .save > .nameBlock > aの値
    save_pitcher_nickname = extract_game_detail(soup, 'save')
    save_pitcher = convert_player_name(save_pitcher_nickname, team_name, player_lookup) if player_lookup else save_pitcher_nickname
    
    # hr_player: .gameDetailInfo01 > .hr > .nameBlock > aの値
    hr_player_nickname = extract_game_detail(soup, 'hr')
    hr_player = convert_player_name(hr_player_nickname, team_name, player_lookup) if player_lookup else hr_player_nickname
    
    # top_or_bottom: team列のチーム名をもとに00_teams_info.csvのkeyと突合し、
    # team_nameの値がtop_teamと同じであれば「top」、bottom_teamと同じであれば「bottom」を格納
    top_or_bottom = ""
    if teams_info and team_name in teams_info:
        team_name_value = teams_info[team_name]
        if team_name_value == top_team:
            top_or_bottom = "top"
        elif team_name_value == bottom_team:
            top_or_bottom = "bottom"
    
    # key: ${team}_${date}_${start_time}_${game_id}
    # game_id: urlを'/'で分割したときに'game'の次の要素
    game_id = ""
    if url:
        try:
            parts = url.split("/")
            if "game" in parts:
                idx = parts.index("game")
                if idx + 1 < len(parts):
                    game_id = parts[idx + 1]
        except Exception:
            game_id = ""

    key = f"{team_name or ''}_{date or ''}_{start_time or ''}_{game_id or ''}"
    
    return {
        'key': key,
        'team': team_name,
        'url': url,
        'type': game_type,
        'date': date,
        'start_time': start_time,
        'place': place,
        'top_or_bottom': top_or_bottom,
        'top_team': top_team,
        'top_team_score': top_team_score,
        'bottom_team': bottom_team,
        'bottom_team_score': bottom_team_score,
        'result': result,
        'top_inning_score_1': top_inning_score_1,
        'top_inning_score_2': top_inning_score_2,
        'top_inning_score_3': top_inning_score_3,
        'top_inning_score_4': top_inning_score_4,
        'top_inning_score_5': top_inning_score_5,
        'top_inning_score_6': top_inning_score_6,
        'top_inning_score_7': top_inning_score_7,
        'top_inning_score_8': top_inning_score_8,
        'top_inning_score_9': top_inning_score_9,
        'bottom_inning_score_1': bottom_inning_score_1,
        'bottom_inning_score_2': bottom_inning_score_2,
        'bottom_inning_score_3': bottom_inning_score_3,
        'bottom_inning_score_4': bottom_inning_score_4,
        'bottom_inning_score_5': bottom_inning_score_5,
        'bottom_inning_score_6': bottom_inning_score_6,
        'bottom_inning_score_7': bottom_inning_score_7,
        'bottom_inning_score_8': bottom_inning_score_8,
        'bottom_inning_score_9': bottom_inning_score_9,
        'win_pitcher': win_pitcher,
        'lose_pitcher': lose_pitcher,
        'save_pitcher': save_pitcher,
        'hr_player': hr_player
    }


def scrape_all_games(team_name, test_mode=False, player_lookup=None, teams_info=None):
    """全ページから試合情報を取得する"""
    base_url = f"https://teams.one/teams/{team_name}/game"
    all_games = []
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
        
        # ul.contentList > li > aのhrefのリンク先を取得
        links = content_list.select('li > a')
        if not links:
            print(f"ページ {page}: リンクが見つかりません。処理を終了します。")
            break
        
        print(f"ページ {page}: {len(links)}件の試合を取得します")
        
        for link in links:
            href = link.get('href')
            if not href:
                continue
            
            # 相対URLの場合は絶対URLに変換
            if not href.startswith('http'):
                href = urljoin(base_url, href)
            
            print(f"  試合詳細を取得中: {href}")
            game_info = scrape_game_detail(href, team_name, player_lookup, teams_info)
            
            if game_info:
                all_games.append(game_info)
            
            # テストモードの場合は最初の1件だけ処理して終了
            if test_mode:
                print("テストモード: 最初の1件のみ処理しました。")
                return all_games
            
            # サーバーに負荷をかけないように少し待機
            time.sleep(0.5)
        
        # テストモードの場合は1ページ目のみ処理
        if test_mode:
            break
        
        page += 1
        # ページ間でも少し待機
        time.sleep(1)
    
    return all_games


def save_to_csv(games, output_dir='output'):
    """取得した試合情報をCSVに保存する"""
    if not games:
        print("保存するデータがありません。")
        return None
    
    # ファイル名を準備（日付なし）
    filename = prepare_csv_filename("01_game_info.csv", output_dir)
    filepath = os.path.join(output_dir, filename)
    
    # CSVに書き込み（keyを先頭列、その後既存の項目）
    fieldnames = [
        'key', 'team', 'url', 'type', 'date', 'start_time', 'place',
        'top_or_bottom', 'top_team', 'top_team_score', 'bottom_team', 'bottom_team_score',
        'result',
        'top_inning_score_1', 'top_inning_score_2', 'top_inning_score_3',
        'top_inning_score_4', 'top_inning_score_5', 'top_inning_score_6',
        'top_inning_score_7', 'top_inning_score_8', 'top_inning_score_9',
        'bottom_inning_score_1', 'bottom_inning_score_2', 'bottom_inning_score_3',
        'bottom_inning_score_4', 'bottom_inning_score_5', 'bottom_inning_score_6',
        'bottom_inning_score_7', 'bottom_inning_score_8', 'bottom_inning_score_9',
        'win_pitcher', 'lose_pitcher', 'save_pitcher', 'hr_player'
    ]
    
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(games)
    
    print(f"\nCSVファイルを保存しました: {filepath}")
    return filepath


def main():
    """メイン処理"""
    # コマンドライン引数を解析
    team_names, test_mode = parse_command_line_args('src/01_get_game_info.py', supports_test_mode=True)
    
    print("=" * 50)
    print("試合情報のスクレイピングを開始します")
    print(f"チーム: {', '.join(team_names)}")
    if test_mode:
        if len(team_names) > 1:
            print("モード: テストモード（各チームについてpage=1の最初の1件ずつ）")
        else:
            print("モード: テストモード（page=1の最初の1件のみ）")
    print("=" * 50)
    
    # プレイヤー情報を読み込む
    player_lookup = load_player_lookup_by_nickname()
    
    # チーム情報を読み込む
    teams_info = load_teams_info()
    
    # 全チームの試合データを取得
    all_games = []
    for team_name in team_names:
        print(f"\n--- {team_name} のデータを取得中 ---")
        games = scrape_all_games(team_name, test_mode=test_mode, player_lookup=player_lookup, teams_info=teams_info)
        if games:
            all_games.extend(games)
            print(f"{team_name}: {len(games)}件の試合データを取得しました")
        else:
            print(f"{team_name}: 試合データが取得できませんでした")
    
    if not all_games:
        print("\n試合データが取得できませんでした。")
        return
    
    print(f"\n合計取得した試合数: {len(all_games)}件")
    
    # CSVに保存
    filepath = save_to_csv(all_games)
    
    print("\n" + "=" * 50)
    print("処理が完了しました！")
    if filepath:
        print(f"出力ファイル: {filepath}")
    print("=" * 50)


if __name__ == "__main__":
    main()
