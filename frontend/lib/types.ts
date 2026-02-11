// Supabaseテーブル構造に基づくTypeScript型定義

export interface Team {
  key: string
  team: string | null
  team_name: string | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface Player {
  key: string
  team: string | null
  player_number: number | null
  player_name: string | null
  nickname: string | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface Game {
  key: string
  team: string | null
  url: string | null
  type: string | null
  date: string | null
  start_time: string | null
  place: string | null
  top_or_bottom: string | null
  top_team: string | null
  top_team_score: number | null
  bottom_team: string | null
  bottom_team_score: number | null
  result: string | null
  top_inning_score_1: number | null
  top_inning_score_2: number | null
  top_inning_score_3: number | null
  top_inning_score_4: number | null
  top_inning_score_5: number | null
  top_inning_score_6: number | null
  top_inning_score_7: number | null
  top_inning_score_8: number | null
  top_inning_score_9: number | null
  bottom_inning_score_1: number | null
  bottom_inning_score_2: number | null
  bottom_inning_score_3: number | null
  bottom_inning_score_4: number | null
  bottom_inning_score_5: number | null
  bottom_inning_score_6: number | null
  bottom_inning_score_7: number | null
  bottom_inning_score_8: number | null
  bottom_inning_score_9: number | null
  win_pitcher: string | null
  lose_pitcher: string | null
  save_pitcher: string | null
  hr_player: string | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface GameHitterStats {
  key: string
  team: string | null
  date: string | null
  start_time: string | null
  player_number: number | null
  player: string | null
  entry: string | null
  order: number | null
  position: string | null
  plate_apperance: number | null
  at_bat: number | null
  hit: number | null
  hr: number | null
  rbi: number | null
  run: number | null
  stolen_base: number | null
  double: number | null
  triple: number | null
  at_bat_in_scoring: number | null
  hit_in_scoring: number | null
  strikeout: number | null
  walk: number | null
  hit_by_pitch: number | null
  sacrifice_bunt: number | null
  sacrifice_fly: number | null
  double_play: number | null
  oponent_error: number | null
  own_error: number | null
  caught_stealing: number | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface GamePitcherStats {
  key: string
  team: string | null
  date: string | null
  start_time: string | null
  player_number: number | null
  player: string | null
  result: string | null
  inning: string | null
  pitches: number | null
  runs_allowed: number | null
  earned_runs: number | null
  complete_game: string | null
  shotout: string | null
  hits_allowed: number | null
  hr_allowed: number | null
  strikeouts: number | null
  walks_allowed: number | null
  hit_batsmen: number | null
  balks: number | null
  wild_pitches: number | null
  order: number | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface TeamStats {
  key: string
  team: string | null
  year: number | null
  games: number | null
  wins: number | null
  losses: number | null
  draws: number | null
  winning_percentage: number | null
  runs_scored: number | null
  runs_allowed: number | null
  batting_average: number | null
  home_runs: number | null
  stolen_bases: number | null
  earned_run_average: number | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface HitterStats {
  key: string
  team: string | null
  year: number | null
  player_number: number | null
  player: string | null
  games_played: number | null
  batting_average: number | null
  plate_appearance: number | null
  at_bats: number | null
  hit: number | null
  hr: number | null
  rbi: number | null
  run: number | null
  stolen_base: number | null
  on_base_percentage: number | null
  slugging_percentage: number | null
  average_in_scoring: number | null
  ops: number | null
  double: number | null
  triple: number | null
  total_bases: number | null
  strikeout: number | null
  walk: number | null
  hit_by_pitch: number | null
  sacrifice_bunt: number | null
  sacrifice_fly: number | null
  double_play: number | null
  opponent_error: number | null
  own_error: number | null
  caught_stealing: number | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}

export interface PitcherStats {
  key: string
  team: string | null
  year: number | null
  player_number: number | null
  player: string | null
  games_played: number | null
  wins: number | null
  holds: number | null
  saves: number | null
  losses: number | null
  win_percentage: number | null
  era: number | null
  innings_pitched: string | null
  pitches_thrown: number | null
  runs_allowed: number | null
  earned_runs_allowed: number | null
  complete_games: number | null
  shutouts: number | null
  hits_allowed: number | null
  home_runs_allowed: number | null
  strikeouts: number | null
  strikeout_rate: number | null
  walks_allowed: number | null
  hit_batters: number | null
  balks: number | null
  wild_pitches: number | null
  k_bb: number | null
  whip: number | null
  delete_flg: number
  created_dt: string
  updated_dt: string
}
