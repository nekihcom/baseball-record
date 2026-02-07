import type { SeasonPitcherStats } from "@/lib/statsTypes";

type CurrentYearPitcherStatsProps = {
  stats: SeasonPitcherStats | null;
  emptyMessage?: string;
};

export function CurrentYearPitcherStats({
  stats,
  emptyMessage = "今シーズンの投手成績はありません。",
}: CurrentYearPitcherStatsProps) {
  if (!stats) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const StatItem = ({ label, value }: { label: string; value: string | number | null }) => (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <span className="text-base md:text-xl font-semibold">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 主要指標 */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
        <StatItem label="登板" value={stats.games_played} />
        <StatItem
          label="防御率"
          value={stats.era != null ? stats.era.toFixed(2) : null}
        />
        <StatItem
          label="勝率"
          value={stats.win_percentage != null ? stats.win_percentage.toFixed(3).slice(1) : null}
        />
        <StatItem
          label="WHIP"
          value={stats.whip != null ? stats.whip.toFixed(3) : null}
        />
        <StatItem label="勝" value={stats.wins} />
        <StatItem label="敗" value={stats.losses} />
        <StatItem label="H" value={stats.holds} />
        <StatItem label="S" value={stats.saves} />
        <StatItem label="投球回" value={stats.innings_pitched} />
        <StatItem label="投球数" value={stats.pitches_thrown ?? 0} />
        <StatItem label="失点" value={stats.runs_allowed} />
        <StatItem label="自責点" value={stats.earned_runs_allowed} />
        <StatItem label="被本塁打" value={stats.home_runs_allowed ?? 0} />
        <StatItem label="奪三振" value={stats.strikeouts} />
        <StatItem label="与四球" value={stats.walks_allowed} />
      </div>
    </div>
  );
}
