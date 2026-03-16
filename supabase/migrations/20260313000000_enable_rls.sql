-- ============================================================
-- RLS (Row Level Security) 設定
-- 全テーブルに対して RLS を有効化し、anon ユーザーには SELECT のみ許可する。
-- INSERT / UPDATE / DELETE は service_role のみに限定する。
-- ============================================================

-- -------------------------------------------------------
-- master_teams_info
-- -------------------------------------------------------
ALTER TABLE master_teams_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select master_teams_info"
  ON master_teams_info FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- master_players_info
-- -------------------------------------------------------
ALTER TABLE master_players_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select master_players_info"
  ON master_players_info FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- transaction_game_info
-- -------------------------------------------------------
ALTER TABLE transaction_game_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select transaction_game_info"
  ON transaction_game_info FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- transaction_game_hitter_stats
-- -------------------------------------------------------
ALTER TABLE transaction_game_hitter_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select transaction_game_hitter_stats"
  ON transaction_game_hitter_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- transaction_game_pitcher_stats
-- -------------------------------------------------------
ALTER TABLE transaction_game_pitcher_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select transaction_game_pitcher_stats"
  ON transaction_game_pitcher_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- transaction_team_stats
-- -------------------------------------------------------
ALTER TABLE transaction_team_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select transaction_team_stats"
  ON transaction_team_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- transaction_hitter_stats
-- -------------------------------------------------------
ALTER TABLE transaction_hitter_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select transaction_hitter_stats"
  ON transaction_hitter_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------
-- transaction_pitcher_stats
-- -------------------------------------------------------
ALTER TABLE transaction_pitcher_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select transaction_pitcher_stats"
  ON transaction_pitcher_stats FOR SELECT
  TO anon, authenticated
  USING (true);
