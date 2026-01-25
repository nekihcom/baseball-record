"""
定数管理ファイル
ファイル名やパスなどの定数を一元管理する
"""
import os

# 入力ディレクトリ
INPUT_DIR = 'input'

# 出力ディレクトリ
OUTPUT_DIR = 'output'

# 選手情報CSVファイル名
PLAYERS_INFO_CSV = '01_players_info.csv'

# 選手情報CSVファイルのパス
PLAYERS_INFO_CSV_PATH = os.path.join(INPUT_DIR, PLAYERS_INFO_CSV)

# チーム情報CSVファイル名
TEAMS_INFO_CSV = '00_teams_info.csv'

# チーム情報CSVファイルのパス
TEAMS_INFO_CSV_PATH = os.path.join(INPUT_DIR, TEAMS_INFO_CSV)
