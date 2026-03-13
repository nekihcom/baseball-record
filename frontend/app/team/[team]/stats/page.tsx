import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getDisplayTeamName } from "@/lib/utils";
import TeamStatsClient from "./StatsClient";

type Props = { params: Promise<{ team: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { team } = await params;

  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) return {};

    const { data } = await supabase
      .from("master_teams_info")
      .select("team_name")
      .eq("key", team)
      .eq("delete_flg", 0)
      .single();

    const teamName = getDisplayTeamName(data?.team_name ?? null, team);
    return {
      title: `${teamName} 成績`,
      openGraph: { title: `${teamName} 成績 | 野球記録システム` },
    };
  } catch {
    return {};
  }
}

export default function TeamStatsPage({ params }: Props) {
  return <TeamStatsClient params={params} />;
}
