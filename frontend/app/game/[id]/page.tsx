import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getDisplayTeamName } from "@/lib/utils";
import GameDetailClient from "./GameDetailClient";

type Props = { params: Promise<{ id: string }> };

function formatGameDate(dateStr: string): string {
  if (dateStr.length !== 8) return dateStr;
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(4, 6), 10);
  const d = parseInt(dateStr.slice(6, 8), 10);
  return `${y}年${m}月${d}日`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const parts = id.split("_");
  if (parts.length !== 3) return {};

  const [date, team, topOrBottom] = parts;

  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) return {};

    const { data } = await supabase
      .from("transaction_game_info")
      .select("top_team, bottom_team")
      .eq("date", date)
      .eq("team", team)
      .eq("top_or_bottom", topOrBottom)
      .eq("delete_flg", 0)
      .single();

    if (!data) return {};

    const topTeam = getDisplayTeamName(data.top_team, null);
    const bottomTeam = getDisplayTeamName(data.bottom_team, null);
    const title = `${topTeam} VS ${bottomTeam} ${formatGameDate(date)}`;
    return {
      title,
      openGraph: { title: `${title} | 野球記録システム` },
    };
  } catch {
    return {};
  }
}

export default function GameDetailPage({ params }: Props) {
  return <GameDetailClient params={params} />;
}
