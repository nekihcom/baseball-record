"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HitterStatsTable } from "./HitterStatsTable";
import { PitcherStatsTable } from "./PitcherStatsTable";
import { CurrentYearHitterStats } from "./CurrentYearHitterStats";
import { CurrentYearPitcherStats } from "./CurrentYearPitcherStats";
import { RecentGamesHitterStats } from "./RecentGamesHitterStats";
import { RecentGamesPitcherStats } from "./RecentGamesPitcherStats";
import { BattingOrderHitterStats } from "./BattingOrderHitterStats";
import { PositionHitterStats } from "./PositionHitterStats";
import type {
  CareerHitterRow,
  CareerPitcherRow,
  RecentGameHitterRow,
  RecentGamePitcherRow,
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
  recentGamesPitcherStats: RecentGamePitcherRow[] | null;
};

export function PlayerStatsTabs({
  currentYearHitterStats,
  currentYearPitcherStats,
  hasCurrentYearPitcherStats,
  careerHitterStats,
  careerPitcherStats,
  hasCareerPitcherStats,
  recentGamesHitterStats,
  recentGamesPitcherStats,
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
            {/* <section className="space-y-4"> */}
              {/* <h2 className="text-xl font-bold">グラウンド別成績</h2> */}
              {/* TODO: グラウンド別成績を表示 */}
            {/* </section> */}
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
                  stats={recentGamesPitcherStats}
                  emptyMessage="直近3試合の成績はありません。"
                />
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
          <TabsContent value="hitter" className="mt-4">
            <HitterStatsTable
              stats={careerHitterStats}
              emptyMessage="通算打者成績はありません。"
            />
          </TabsContent>
          {hasCareerPitcherStats && (
            <TabsContent value="pitcher" className="mt-4">
              <PitcherStatsTable
                stats={careerPitcherStats}
                emptyMessage="通算投手成績はありません。"
              />
            </TabsContent>
          )}
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}
