import type { SeasonHitterStats } from "@/lib/statsTypes";

type CurrentYearHitterStatsProps = {
  stats: SeasonHitterStats | null;
  emptyMessage?: string;
};

export function CurrentYearHitterStats({
  stats,
  emptyMessage = "今シーズンの打者成績はありません。",
}: CurrentYearHitterStatsProps) {
  if (!stats) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const StatItem = ({ label, value }: { label: string; value: string | number | null }) => (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <span className="text-base font-semibold">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1行目: 試合　打率　打席　打数　安打　本塁打 */}
      <div className="grid grid-cols-13 gap-2">
        <StatItem label="試合" value={stats.games_played} />
        <StatItem
          label="打率"
          value={stats.batting_average != null ? stats.batting_average.toFixed(3).slice(1) : null}
        />
        <StatItem label="打席" value={stats.plate_appearance} />
        <StatItem label="打数" value={stats.at_bats} />
        <StatItem label="安打" value={stats.hit} />
        <StatItem label="本塁打" value={stats.hr} />
        <StatItem label="打点" value={stats.rbi} />
        <StatItem label="盗塁" value={stats.stolen_base} />
        <StatItem
          label="得点圏打率"
          value={stats.average_in_scoring != null ? stats.average_in_scoring.toFixed(3).slice(1) : null}
        />
        <StatItem
          label="出塁率"
          value={stats.on_base_percentage != null ? stats.on_base_percentage.toFixed(3).slice(1) : null}
        />
        <StatItem
          label="長打率"
          value={stats.slugging_percentage != null ? stats.slugging_percentage.toFixed(3).slice(1) : null}
        />
        <StatItem
          label="OPS"
          value={stats.ops != null ? stats.ops.toFixed(3) : null}
        />
        <StatItem label="得点" value={stats.run} />
        <StatItem label="三振" value={stats.strikeout} />
        <StatItem label="二塁打" value={stats.double} />
        <StatItem label="三塁打" value={stats.triple} />
        <StatItem label="塁打数" value={stats.total_bases} />
        <StatItem label="四球" value={stats.walk} />
        <StatItem label="死球" value={stats.hit_by_pitch} />
        <StatItem label="犠打" value={stats.sacrifice_bunt} />
        <StatItem label="犠飛" value={stats.sacrifice_fly} />
        <StatItem label="併殺打" value={stats.double_play} />
        <StatItem label="敵失" value={stats.opponent_error} />
        <StatItem label="盗塁阻止" value={stats.caught_stealing} />
        <StatItem label="エラー" value={stats.own_error} />
      </div>
    </div>
  );
}
