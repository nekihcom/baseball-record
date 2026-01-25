# 野球記録スクレイピングシステム

## 概要

このプロジェクトは、野球の試合情報や選手成績を自動的にスクレイピングし、CSVファイルとして保存するシステムです。複数のスクレイピングスクリプトを順次実行し、包括的な野球データを収集します。

## プロジェクト構成

```
baseball-record/
├── src/                          # ソースコード
│   ├── 00_run_all.py            # メインスクリプト（全スクリプトを順次実行）
│   ├── 01_get_game_info.py      # 試合情報の取得
│   ├── 02_get_game_hitter_stats.py  # 試合別打者成績の取得
│   ├── 03_get_game_pitcher_stats.py # 試合別投手成績の取得
│   ├── 04_get_team_stats.py     # チーム成績の取得
│   ├── 05_get_hitter_stats.py   # 打者成績の取得
│   ├── 06_get_pitcher_stats.py  # 投手成績の取得
│   ├── 99_utils.py              # 共通ユーティリティ関数
│   └── constants.py              # 定数定義
├── input/                        # 入力ファイル
│   ├── 00_teams_info.csv        # チーム情報
│   └── 01_players_info.csv       # 選手情報
└── output/                       # 出力ファイル（CSV）
```

## 機能

### 00_run_all.py の主な機能

`00_run_all.py` は、以下の6つのスクレイピングスクリプトを順次実行するメインスクリプトです：

1. **01_get_game_info.py** - 試合情報の取得
2. **02_get_game_hitter_stats.py** - 試合別打者成績の取得
3. **03_get_game_pitcher_stats.py** - 試合別投手成績の取得
4. **04_get_team_stats.py** - チーム成績の取得
5. **05_get_hitter_stats.py** - 打者成績の取得
6. **06_get_pitcher_stats.py** - 投手成績の取得

### 特徴

- **複数チーム対応**: 1回の実行で複数のチームのデータを取得可能
- **テストモード**: `--test` オプションで少量のデータのみ取得して動作確認
- **エラーハンドリング**: 個別のスクリプトでエラーが発生しても処理を継続
- **実行結果サマリー**: 全スクリプトの実行結果を一覧表示
- **自動ファイル管理**: 既存の出力ファイルを日付付きで自動リネーム

## 使用方法

### 基本的な使用方法

```bash
# 単一チームのデータを取得
python3 src/00_run_all.py orcas

# 複数チームのデータを取得
python3 src/00_run_all.py orcas swallows-fan

# テストモード（少量のデータのみ取得）
python3 src/00_run_all.py orcas --test
```

### コマンドライン引数

- **チーム名** (必須): 1つ以上のチーム名を指定
  - 英数字、ハイフン(`-`)、アンダースコア(`_`)のみ使用可能
  - 例: `orcas`, `swallows-fan`
- **--test** (オプション): テストモードを有効化
  - 各スクリプトで少量のデータのみ取得
  - 動作確認やデバッグに使用

### 実行例

```bash
# 通常モード（全データ取得）
python3 src/00_run_all.py orcas swallows-fan

# テストモード（少量データのみ）
python3 src/00_run_all.py orcas swallows-fan --test
```

## 入力ファイル

### チーム情報 (input/00_teams_info.csv)

チームのキーとチーム名のマッピングを定義します。

```csv
key, team, team_name
orcas, orcas, ORCAS
swallows-fan, swallows-fan, スワローズファン友の会(スワ友)
```

- **key**: チームの識別子（コマンドライン引数で使用）
- **team**: チームコード
- **team_name**: チームの正式名称

### 選手情報 (input/01_players_info.csv)

選手の情報を定義します。

```csv
key, team, player_number, player_name, nickname
orcas_0, orcas, 0, 選手名A, ニックネームA
orcas_1, orcas, 1, 選手名B, ニックネームB
```

- **key**: 選手の識別子（`${team}_${player_number}` 形式）
- **team**: チームコード
- **player_number**: 背番号
- **player_name**: 選手名
- **nickname**: ニックネーム

## 出力ファイル

すべての出力ファイルは `output/` ディレクトリに保存されます。

### ファイル命名規則

- 既存のファイルが存在する場合、実行日付（`yyyymmdd`）を付加してリネームされます
- 例: `01_game_info.csv` → `01_game_info_20260124.csv`
- 新しい実行結果は常に日付なしのファイル名で保存されます

### 主な出力ファイル

- `01_game_info.csv` - 試合情報
- `02_game_hitter_stats.csv` - 試合別打者成績
- `03_game_pitcher_stats.csv` - 試合別投手成績
- `04_team_stats.csv` - チーム成績
- `05_hitter_stats.csv` - 打者成績
- `06_pitcher_stats.csv` - 投手成績

## CSVファイル項目定義

### 入力ファイル

#### チーム情報 (input/00_teams_info.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| key | 文字列 | チームの識別子（コマンドライン引数で使用） |
| team | 文字列 | チームコード |
| team_name | 文字列 | チームの正式名称 |

#### 選手情報 (input/01_players_info.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| key | 文字列 | 選手の識別子（`${team}_${player_number}` 形式） |
| team | 文字列 | チームコード |
| player_number | 数値 | 背番号 |
| player_name | 文字列 | 選手名 |
| nickname | 文字列 | ニックネーム |

### 出力ファイル

#### 試合情報 (output/01_game_info.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| team | 文字列 | チームコード |
| url | 文字列 | 試合詳細ページのURL |
| type | 文字列 | 試合種別（例: 練習試合、公式戦） |
| date | 文字列 | 試合日（yyyymmdd形式） |
| start_time | 文字列 | 開始時刻 |
| place | 文字列 | 試合会場 |
| top_or_bottom | 文字列 | 先攻/後攻（top/bottom） |
| top_team | 文字列 | 先攻チーム名 |
| top_team_score | 数値 | 先攻チーム得点 |
| bottom_team | 文字列 | 後攻チーム名 |
| bottom_team_score | 数値 | 後攻チーム得点 |
| result | 文字列 | 試合結果（勝ち/負け） |
| top_inning_score_1〜9 | 数値 | 先攻チームの1〜9回目の得点 |
| bottom_inning_score_1〜9 | 数値 | 後攻チームの1〜9回目の得点 |
| win_pitcher | 文字列 | 勝利投手 |
| lose_pitcher | 文字列 | 敗戦投手 |
| hr_player | 文字列 | ホームラン打者 |

#### 試合別打者成績 (output/02_game_hitter_stats.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| team | 文字列 | チームコード |
| date | 文字列 | 試合日（yyyymmdd形式） |
| start_time | 文字列 | 開始時刻 |
| player_number | 数値 | 背番号 |
| player | 文字列 | 選手名 |
| entry | 文字列 | 出場区分（先発/途中出場など） |
| order | 数値 | 打順 |
| position | 文字列 | 守備位置 |
| plate_apperance | 数値 | 打席 |
| at_bat | 数値 | 打数 |
| hit | 数値 | 安打 |
| hr | 数値 | 本塁打 |
| rbi | 数値 | 打点 |
| run | 数値 | 得点 |
| stolen_base | 数値 | 盗塁 |
| double | 数値 | 二塁打 |
| triple | 数値 | 三塁打 |
| at_bat_in_scoring | 数値 | 得点圏打数 |
| hit_in_scoring | 数値 | 得点圏安打 |
| strikeout | 数値 | 三振 |
| walk | 数値 | 四球 |
| hit_by_pitch | 数値 | 死球 |
| sacrifice_bunt | 数値 | 犠打 |
| sacrifice_fly | 数値 | 犠飛 |
| double_play | 数値 | 併殺打 |
| oponent_error | 数値 | 敵失 |
| own_error | 数値 | エラー |
| caught_stealing | 数値 | 盗塁阻止 |

#### 試合別投手成績 (output/03_game_pitcher_stats.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| team | 文字列 | チームコード |
| date | 文字列 | 試合日（yyyymmdd形式） |
| start_time | 文字列 | 開始時刻 |
| player_number | 数値 | 背番号 |
| player | 文字列 | 選手名 |
| result | 文字列 | 勝敗（勝/負/セーブなど） |
| inning | 文字列 | 投球回 |
| pitches | 数値 | 投球 |
| runs_allowed | 数値 | 失点 |
| earned_runs | 数値 | 自責点 |
| complete_game | 文字列 | 完投（- または 完投） |
| shotout | 文字列 | 完封（- または 完封） |
| hits_allowed | 数値 | 被安打 |
| hr_allowed | 数値 | 被本塁打 |
| strikeouts | 数値 | 奪三振 |
| walks_allowed | 数値 | 与四球 |
| hit_batsmen | 数値 | 与死球 |
| balks | 数値 | ボーク |
| wild_pitches | 数値 | 暴投 |
| order | 数値 | 登板順 |

#### チーム成績 (output/04_team_stats.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| team | 文字列 | チームコード |
| year | 数値 | 年度 |
| games | 数値 | 試合数 |
| wins | 数値 | 勝利 |
| losses | 数値 | 敗戦 |
| draws | 数値 | 引き分け |
| winning_percentage | 数値 | 勝率 |
| runs_scored | 数値 | 得点 |
| runs_allowed | 数値 | 失点 |
| batting_average | 数値 | チーム打率 |
| home_runs | 数値 | 本塁打 |
| stolen_bases | 数値 | 盗塁 |
| earned_run_average | 数値 | 防御率 |

#### 打者成績 (output/05_hitter_stats.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| team | 文字列 | チームコード |
| year | 数値 | 年度 |
| player_number | 数値 | 背番号 |
| player | 文字列 | 選手名 |
| games_played | 数値 | 試合出場数 |
| batting_average | 数値 | 打率 |
| plate_appearance | 数値 | 打席 |
| at_bats | 数値 | 打数 |
| hit | 数値 | 安打 |
| hr | 数値 | 本塁打 |
| rbi | 数値 | 打点 |
| run | 数値 | 得点 |
| stolen_base | 数値 | 盗塁 |
| on_base_percentage | 数値 | 出塁率 |
| slugging_percentage | 数値 | 長打率 |
| average_in_scoring | 数値 | 得点圏打率 |
| ops | 数値 | OPS |
| double | 数値 | 二塁打 |
| triple | 数値 | 三塁打 |
| total_bases | 数値 | 塁打 |
| strikeout | 数値 | 三振 |
| walk | 数値 | 四球 |
| hit_by_pitch | 数値 | 死球 |
| sacrifice_bunt | 数値 | 犠打 |
| sacrifice_fly | 数値 | 犠飛 |
| double_play | 数値 | 併殺打 |
| opponent_error | 数値 | 敵失 |
| own_error | 数値 | エラー |
| caught_stealing | 数値 | 盗塁阻止 |

#### 投手成績 (output/06_pitcher_stats.csv)

| 項目名 | 型 | 説明 |
|--------|-----|------|
| team | 文字列 | チームコード |
| year | 数値 | 年度 |
| player_number | 数値 | 背番号 |
| player | 文字列 | 選手名 |
| games_played | 数値 | 登板数 |
| wins | 数値 | 勝利 |
| holds | 数値 | ホールド |
| saves | 数値 | セーブ |
| losses | 数値 | 敗戦 |
| win_percentage | 数値 | 勝率 |
| era | 数値 | 防御率 |
| innings_pitched | 文字列 | 投球回 |
| pitches_thrown | 数値 | 投球 |
| runs_allowed | 数値 | 失点 |
| earned_runs_allowed | 数値 | 自責点 |
| complete_games | 数値 | 完投 |
| shutouts | 数値 | 完封 |
| hits_allowed | 数値 | 被安打 |
| home_runs_allowed | 数値 | 被本塁打 |
| strikeouts | 数値 | 奪三振 |
| strikeout_rate | 数値 | 奪三振率 |
| walks_allowed | 数値 | 与四球 |
| hit_batters | 数値 | 与死球 |
| balks | 数値 | ボーク |
| wild_pitches | 数値 | 暴投 |
| k_bb | 数値 | K/BB |
| whip | 数値 | WHIP |

#### 補足事項

##### 投球回（innings_pitched）を使用した指標の計算について

`strikeout_rate`（奪三振率）などの指標を計算する際、`innings_pitched`列の値を小数に変換して使用します。

**変換ルール：**

1. `innings_pitched`列の値を「回」で分割します
   - 分割後の1番目を`innings_pitched_former`、2番目を`innings_pitched_latter`とします

2. `innings_pitched_latter`の値に応じて、以下のように小数値（`INNING`）を計算します：
   - `innings_pitched_latter`が「0/3」の場合：`INNING` = `innings_pitched_former`
   - `innings_pitched_latter`が「1/3」の場合：`INNING` = `innings_pitched_former + 0.33333`
   - `innings_pitched_latter`が「2/3」の場合：`INNING` = `innings_pitched_former + 0.66667`

**計算例：**
- `innings_pitched`が「7回1/3」の場合：`INNING` = 7.33333
- `innings_pitched`が「5回0/3」の場合：`INNING` = 5.0
- `innings_pitched`が「3回2/3」の場合：`INNING` = 3.66667

**奪三振率（strikeout_rate）の計算式：**
```
strikeout_rate = (strikeouts * 7) / INNING
```

**K/BB（k_bb）の計算式：**
```
k_bb = strikeouts / walks_allowed
```

**WHIP（whip）の計算式：**
```
whip = (hits_allowed + walks_allowed) / INNING
```

## 実行フロー

1. **引数解析**: コマンドライン引数からチーム名とテストモードを取得
2. **バリデーション**: チーム名の形式をチェック
3. **スクリプト実行**: 定義された順序で各スクリプトを実行
   - 各スクリプトは独立したプロセスとして実行
   - エラーが発生しても次のスクリプトの実行を継続
4. **結果集計**: 全スクリプトの実行結果を集計
5. **サマリー表示**: 成功/失敗の一覧を表示

## エラーハンドリング

- 個別のスクリプトでエラーが発生しても、処理は継続されます
- 各スクリプトの実行結果（成功/失敗）が記録され、最後にサマリーとして表示されます
- テストモードでない場合、エラーが発生したスクリプトがあっても警告を表示して続行します
- 全てのスクリプトが成功した場合のみ、終了コード0で終了します

## 依存関係

必要なPythonパッケージ：

- `requests` - HTTPリクエスト
- `beautifulsoup4` - HTMLパース
- 標準ライブラリ: `sys`, `subprocess`, `os`, `csv`, `re`, `datetime`

## 注意事項

- スクレイピング先のサーバーに負荷をかけないよう、適切な間隔を空けて実行してください
- テストモードを使用して動作確認してから、本番実行を行うことを推奨します
- チーム名は英数字のみで指定してください（ハイフン、アンダースコアは使用可能）
- 出力ファイルは実行のたびに既存ファイルがリネームされるため、必要なデータは事前にバックアップしてください

## 開発者向け情報

### スクリプトの追加方法

新しいスクリプトを追加する場合、`00_run_all.py` の `scripts` リストに追加してください：

```python
scripts = [
    'src/01_get_game_info.py',
    # ... 既存のスクリプト ...
    'src/07_new_script.py',  # 新しいスクリプトを追加
]
```

### 共通機能

- `99_utils.py` に共通のユーティリティ関数が定義されています
- `constants.py` にファイルパスなどの定数が定義されています
- 各スクリプトは `parse_command_line_args()` を使用して引数を解析します

## ライセンス
- 開発者の許諾なく編集、改変した上で再配布を禁ずる
- 開発者の許諾なく営利目的で再配布することを禁ずる
