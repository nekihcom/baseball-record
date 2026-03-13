import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getDisplayTeamName } from "@/lib/utils";
import TeamPlayerDetailClient from "./PlayerDetailClient";

type Props = { params: Promise<{ team: string; player_number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { team, player_number } = await params;

  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) return {};

    const [{ data: teamData }, { data: playerData }] = await Promise.all([
      supabase
        .from("master_teams_info")
        .select("team_name")
        .eq("key", team)
        .eq("delete_flg", 0)
        .single(),
      supabase
        .from("master_players_info")
        .select("player_name, nickname")
        .eq("team", team)
        .eq("player_number", parseInt(player_number, 10))
        .eq("delete_flg", 0)
        .single(),
    ]);

    const teamName = getDisplayTeamName(teamData?.team_name ?? null, team);
    const playerName = playerData?.player_name ?? playerData?.nickname ?? `#${player_number}`;
    return {
      title: `${playerName} (${teamName})`,
      openGraph: { title: `${playerName} (${teamName}) | 野球記録システム` },
    };
  } catch {
    return {};
  }
}

export default function TeamPlayerDetailPage({ params }: Props) {
  return <TeamPlayerDetailClient params={params} />;
}
