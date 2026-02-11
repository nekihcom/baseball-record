-- 野球記録用テーブル定義（PostgreSQL / Supabase）
-- README 項目定義・実際のCSVヘッダーに準拠

-- 既存テーブルを削除（逆順でDROP）
DROP TABLE IF EXISTS
    transaction_pitcher_stats,
    transaction_hitter_stats,
    transaction_team_stats,
    transaction_game_pitcher_stats,
    transaction_game_hitter_stats,
    transaction_game_info,
    master_players_info,
    master_teams_info
CASCADE;

-- 1. teams_info
CREATE TABLE master_teams_info (
    key TEXT PRIMARY KEY,
    team TEXT,
    team_name TEXT,
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. players_info
CREATE TABLE master_players_info (
    key TEXT PRIMARY KEY,
    team TEXT,
    player_number INTEGER,
    player_name TEXT,
    nickname TEXT,
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. game_info
CREATE TABLE transaction_game_info (
    key TEXT PRIMARY KEY,
    team TEXT,
    url TEXT,
    "type" TEXT,
    date TEXT,
    start_time TEXT,
    place TEXT,
    top_or_bottom TEXT,
    top_team TEXT,
    top_team_score INTEGER,
    bottom_team TEXT,
    bottom_team_score INTEGER,
    result TEXT,
    top_inning_score_1 INTEGER,
    top_inning_score_2 INTEGER,
    top_inning_score_3 INTEGER,
    top_inning_score_4 INTEGER,
    top_inning_score_5 INTEGER,
    top_inning_score_6 INTEGER,
    top_inning_score_7 INTEGER,
    top_inning_score_8 INTEGER,
    top_inning_score_9 INTEGER,
    bottom_inning_score_1 INTEGER,
    bottom_inning_score_2 INTEGER,
    bottom_inning_score_3 INTEGER,
    bottom_inning_score_4 INTEGER,
    bottom_inning_score_5 INTEGER,
    bottom_inning_score_6 INTEGER,
    bottom_inning_score_7 INTEGER,
    bottom_inning_score_8 INTEGER,
    bottom_inning_score_9 INTEGER,
    win_pitcher TEXT,
    lose_pitcher TEXT,
    save_pitcher TEXT,
    hr_player TEXT,
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. game_hitter_stats
CREATE TABLE transaction_game_hitter_stats (
    key TEXT PRIMARY KEY,
    team TEXT,
    url TEXT,
    date TEXT,
    start_time TEXT,
    player_number INTEGER,
    player TEXT,
    entry TEXT,
    "order" INTEGER,
    position TEXT,
    plate_apperance INTEGER,
    at_bat INTEGER,
    hit INTEGER,
    hr INTEGER,
    rbi INTEGER,
    run INTEGER,
    stolen_base INTEGER,
    "double" INTEGER,
    triple INTEGER,
    at_bat_in_scoring INTEGER,
    hit_in_scoring INTEGER,
    strikeout INTEGER,
    walk INTEGER,
    hit_by_pitch INTEGER,
    sacrifice_bunt INTEGER,
    sacrifice_fly INTEGER,
    double_play INTEGER,
    oponent_error INTEGER,
    own_error INTEGER,
    caught_stealing INTEGER,
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. game_pitcher_stats
CREATE TABLE transaction_game_pitcher_stats (
    key TEXT PRIMARY KEY,
    team TEXT,
    url TEXT,
    date TEXT,
    start_time TEXT,
    player_number INTEGER,
    player TEXT,
    result TEXT,
    inning TEXT,
    pitches INTEGER,
    runs_allowed INTEGER,
    earned_runs INTEGER,
    complete_game TEXT,
    shotout TEXT,
    hits_allowed INTEGER,
    hr_allowed INTEGER,
    strikeouts INTEGER,
    walks_allowed INTEGER,
    hit_batsmen INTEGER,
    balks INTEGER,
    wild_pitches INTEGER,
    "order" INTEGER,
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. team_stats
CREATE TABLE transaction_team_stats (
    key TEXT PRIMARY KEY,
    team TEXT,
    year INTEGER,
    games INTEGER,
    wins INTEGER,
    losses INTEGER,
    draws INTEGER,
    winning_percentage NUMERIC(6,3),
    runs_scored INTEGER,
    runs_allowed INTEGER,
    batting_average NUMERIC(6,3),
    home_runs INTEGER,
    stolen_bases INTEGER,
    earned_run_average NUMERIC(6,2),
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. hitter_stats
CREATE TABLE transaction_hitter_stats (
    key TEXT PRIMARY KEY,
    team TEXT,
    year INTEGER,
    player_number INTEGER,
    player TEXT,
    games_played INTEGER,
    batting_average NUMERIC(6,3),
    plate_appearance INTEGER,
    at_bats INTEGER,
    hit INTEGER,
    hr INTEGER,
    rbi INTEGER,
    run INTEGER,
    stolen_base INTEGER,
    on_base_percentage NUMERIC(6,3),
    slugging_percentage NUMERIC(6,3),
    average_in_scoring NUMERIC(6,3),
    ops NUMERIC(6,3),
    "double" INTEGER,
    triple INTEGER,
    total_bases INTEGER,
    strikeout INTEGER,
    walk INTEGER,
    hit_by_pitch INTEGER,
    sacrifice_bunt INTEGER,
    sacrifice_fly INTEGER,
    double_play INTEGER,
    opponent_error INTEGER,
    own_error INTEGER,
    caught_stealing INTEGER,
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. pitcher_stats
CREATE TABLE transaction_pitcher_stats (
    key TEXT PRIMARY KEY,
    team TEXT,
    year INTEGER,
    player_number INTEGER,
    player TEXT,
    games_played INTEGER,
    wins INTEGER,
    holds INTEGER,
    saves INTEGER,
    losses INTEGER,
    win_percentage NUMERIC(6,3),
    era NUMERIC(6,2),
    innings_pitched TEXT,
    pitches_thrown INTEGER,
    runs_allowed INTEGER,
    earned_runs_allowed INTEGER,
    complete_games INTEGER,
    shutouts INTEGER,
    hits_allowed INTEGER,
    home_runs_allowed INTEGER,
    strikeouts INTEGER,
    strikeout_rate NUMERIC(8,3),
    walks_allowed INTEGER,
    hit_batters INTEGER,
    balks INTEGER,
    wild_pitches INTEGER,
    k_bb NUMERIC(8,3),
    whip NUMERIC(6,3),
    delete_flg INTEGER NOT NULL DEFAULT 0,
    created_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
