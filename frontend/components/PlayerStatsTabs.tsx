"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HitterStatsTable } from "./HitterStatsTable";
import { PitcherStatsTable } from "./PitcherStatsTable";
import { CurrentYearHitterStats } from "./CurrentYearHitterStats";
import { CurrentYearPitcherStats } from "./CurrentYearPitcherStats";
import { RecentGamesHitterStats } from "./RecentGamesHitterStats";
import { RecentGamesPitcherStats } from "./RecentGamesPitcherStats";
import { UsagePitcherStats } from "./UsagePitcherStats";
import { GroundPitcherStats } from "./GroundPitcherStats";
import { BattingOrderHitterStats } from "./BattingOrderHitterStats";
import { PositionHitterStats } from "./PositionHitterStats";
import { GroundHitterStats } from "./GroundHitterStats";
import { MonthlyHitterStats } from "./MonthlyHitterStats";
import { MonthlyPitcherStats } from "./MonthlyPitcherStats";
import type {
  CareerHitterRow,
  CareerPitcherRow,
  RecentGameHitterRow,
  RecentGameHitterRowWithPlace,
  RecentGamePitcherRow,
  RecentGamePitcherRowWithPlace,
  SeasonHitterStats,
  SeasonPitcherStats,
} from "@/lib/statsTypes";

type PlayerStatsTabsProps = {
  currentYearHitterStats: SeasonHitterStats | null;
  currentYearPitcherStats: SeasonPitcherStats | null;
  hasCurrentYearPitcherStats: boolean;
  careerHitterStats: CareerHitterRow[] | null;
  careerPitcherStats: CareerPitcherRow[] | null;
  hasCareerPitcherStats: boolean;
  recentGamesHitterStats: RecentGameHitterRow[] | null;
  recentGamesHitterStatsWithPlace: RecentGameHitterRowWithPlace[] | null;
  recentGamesPitcherStats: RecentGamePitcherRow[] | null;
  recentGamesPitcherStatsWithPlace: RecentGamePitcherRowWithPlace[] | null;
  careerGamesHitterStats: RecentGameHitterRow[] | null;
  careerGamesHitterStatsWithPlace: RecentGameHitterRowWithPlace[] | null;
  careerGamesPitcherStats: RecentGamePitcherRow[] | null;
  careerGamesPitcherStatsWithPlace: RecentGamePitcherRowWithPlace[] | null;
};

export function PlayerStatsTabs({
  currentYearHitterStats,
  currentYearPitcherStats,
  hasCurrentYearPitcherStats,
  careerHitterStats,
  careerPitcherStats,
  hasCareerPitcherStats,
  recentGamesHitterStats,
  recentGamesHitterStatsWithPlace,
  recentGamesPitcherStats,
  recentGamesPitcherStatsWithPlace,
  careerGamesHitterStats,
  careerGamesHitterStatsWithPlace,
  careerGamesPitcherStats,
  careerGamesPitcherStatsWithPlace,
}: PlayerStatsTabsProps) {
  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="current" className="flex-1">
          今シーズンの成績
        </TabsTrigger>
        <TabsTrigger value="career" className="flex-1">
          通算成績
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current" className="mt-4">
        <Tabs defaultValue="hitter" className="w-full">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="hitter" className="flex-1">
              打者成績
            </TabsTrigger>
            {hasCurrentYearPitcherStats && (
              <TabsTrigger value="pitcher" className="flex-1">
                投手成績
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="hitter" className="mt-4 space-y-8">
            <CurrentYearHitterStats
              stats={currentYearHitterStats}
              emptyMessage="今シーズンの打者成績はありません。"
            />
            <section className="space-y-4">
              <h2 className="text-xl font-bold">直近3試合の成績</h2>
              <RecentGamesHitterStats
                stats={recentGamesHitterStats}
                emptyMessage="直近3試合の成績はありません。"
              />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">打順別成績</h2>
              <BattingOrderHitterStats stats={recentGamesHitterStats} />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">ポジション別成績</h2>
              <PositionHitterStats stats={recentGamesHitterStats} />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">グラウンド別成績</h2>
              <GroundHitterStats stats={recentGamesHitterStatsWithPlace} />
            </section>
          </TabsContent>
          {hasCurrentYearPitcherStats && (
            <TabsContent value="pitcher" className="mt-4 space-y-8">
              <CurrentYearPitcherStats
                stats={currentYearPitcherStats}
                emptyMessage="今シーズンの投手成績はありません。"
              />
              <section className="space-y-4">
                <h2 className="text-xl font-bold">直近3試合の成績</h2>
                <RecentGamesPitcherStats
                  stats={recentGamesPitcherStats?.slice(0, 3) ?? null}
                  emptyMessage="直近3試合の成績はありません。"
                />
              </section>
              <section className="space-y-4">
                <h2 className="text-xl font-bold">起用法別成績</h2>
                <UsagePitcherStats stats={recentGamesPitcherStats} />
              </section>
              <section className="space-y-4">
                <h2 className="text-xl font-bold">グラウンド別成績</h2>
                <GroundPitcherStats stats={recentGamesPitcherStatsWithPlace} />
              </section>
            </TabsContent>
          )}
        </Tabs>
      </TabsContent>
      <TabsContent value="career" className="mt-4">
        <Tabs defaultValue="hitter" className="w-full">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="hitter" className="flex-1">
              打者成績
            </TabsTrigger>
            {hasCareerPitcherStats && (
              <TabsTrigger value="pitcher" className="flex-1">
                投手成績
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="hitter" className="mt-4 space-y-8">
            <HitterStatsTable
              stats={careerHitterStats}
              emptyMessage="通算打者成績はありません。"
            />
            <section className="space-y-4">
              <h2 className="text-xl font-bold">直近3試合の成績</h2>
              <RecentGamesHitterStats
                stats={careerGamesHitterStats?.slice(0, 3) ?? null}
                emptyMessage="直近3試合の成績はありません。"
              />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">打順別成績</h2>
              <BattingOrderHitterStats stats={careerGamesHitterStats} />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">ポジション別成績</h2>
              <PositionHitterStats stats={careerGamesHitterStats} />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">グラウンド別成績</h2>
              <GroundHitterStats stats={careerGamesHitterStatsWithPlace} />
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold">月別成績</h2>
              <MonthlyHitterStats stats={careerGamesHitterStats} />
            </section>
          </TabsContent>
          {hasCareerPitcherStats && (
            <TabsContent value="pitcher" className="mt-4 space-y-8">
              <PitcherStatsTable
                stats={careerPitcherStats}
                emptyMessage="通算投手成績はありません。"
              />
              <section className="space-y-4">
                <h2 className="text-xl font-bold">直近3試合の成績</h2>
                <RecentGamesPitcherStats
                  stats={careerGamesPitcherStats?.slice(0, 3) ?? null}
                  emptyMessage="直近3試合の成績はありません。"
                />
              </section>
              <section className="space-y-4">
                <h2 className="text-xl font-bold">起用法別成績</h2>
                <UsagePitcherStats stats={careerGamesPitcherStats} />
              </section>
              <section className="space-y-4">
                <h2 className="text-xl font-bold">グラウンド別成績</h2>
                <GroundPitcherStats stats={careerGamesPitcherStatsWithPlace} />
              </section>
              <section className="space-y-4">
                <h2 className="text-xl font-bold">月別成績</h2>
                <MonthlyPitcherStats stats={careerGamesPitcherStats} />
              </section>
            </TabsContent>
          )}
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}
