import type { GameHitterStats, GamePitcherStats, HitterStats, PitcherStats } from "@/lib/types";

// 今シーズン（選手詳細のダッシュボード表示用）
export type SeasonHitterStats = Pick<
  HitterStats,
  | "year"
  | "games_played"
  | "batting_average"
  | "plate_appearance"
  | "at_bats"
  | "hit"
  | "hr"
  | "rbi"
  | "run"
  | "stolen_base"
  | "on_base_percentage"
  | "slugging_percentage"
  | "average_in_scoring"
  | "ops"
  | "double"
  | "triple"
  | "total_bases"
  | "strikeout"
  | "walk"
  | "hit_by_pitch"
  | "sacrifice_bunt"
  | "sacrifice_fly"
  | "double_play"
  | "opponent_error"
  | "own_error"
  | "caught_stealing"
>;

export type SeasonPitcherStats = Pick<
  PitcherStats,
  | "year"
  | "games_played"
  | "wins"
  | "losses"
  | "holds"
  | "saves"
  | "win_percentage"
  | "era"
  | "innings_pitched"
  | "pitches_thrown"
  | "runs_allowed"
  | "earned_runs_allowed"
  | "strikeouts"
  | "walks_allowed"
  | "home_runs_allowed"
  | "whip"
>;

// 通算（年度別テーブル用）
export type CareerHitterRow = Pick<
  HitterStats,
  | "year"
  | "games_played"
  | "batting_average"
  | "plate_appearance"
  | "at_bats"
  | "hit"
  | "hr"
  | "rbi"
  | "run"
  | "stolen_base"
  | "on_base_percentage"
  | "slugging_percentage"
  | "ops"
  | "strikeout"
  | "walk"
>;

export type CareerPitcherRow = Pick<
  PitcherStats,
  | "year"
  | "games_played"
  | "wins"
  | "losses"
  | "holds"
  | "saves"
  | "win_percentage"
  | "era"
  | "innings_pitched"
  | "pitches_thrown"
  | "runs_allowed"
  | "earned_runs_allowed"
  | "strikeouts"
  | "walks_allowed"
  | "home_runs_allowed"
  | "whip"
>;

// 試合別打者成績（直近3試合/打順別などで再利用）
export type RecentGameHitterRow = Pick<
  GameHitterStats,
  | "date"
  | "order"
  | "position"
  | "plate_apperance"
  | "at_bat"
  | "hit"
  | "hr"
  | "rbi"
  | "stolen_base"
  | "at_bat_in_scoring"
  | "hit_in_scoring"
>;

// 試合別投手成績（直近3試合用）
export type RecentGamePitcherRow = Pick<
  GamePitcherStats,
  | "date"
  | "order"
  | "result"
  | "inning"
  | "runs_allowed"
  | "earned_runs"
  | "hits_allowed"
  | "strikeouts"
  | "walks_allowed"
  | "hit_batsmen"
>;

