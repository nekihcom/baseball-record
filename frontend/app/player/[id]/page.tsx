"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

/** URL id (team_player_number) から team と player_number を解析 */
function parsePlayerId(id: string): { team: string; player_number: string } | null {
  const lastUnderscore = id.lastIndexOf("_");
  if (lastUnderscore <= 0) return null;
  return {
    team: id.slice(0, lastUnderscore),
    player_number: id.slice(lastUnderscore + 1),
  };
}

export default function PlayerDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    const id = params?.id as string | undefined;
    if (!id || redirected) return;

    const parsed = parsePlayerId(id);
    if (parsed) {
      setRedirected(true);
      router.replace(`/team/${parsed.team}/player/${parsed.player_number}`);
    } else {
      router.replace("/team");
    }
  }, [params?.id, router, redirected]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">リダイレクト中...</p>
    </div>
  );
}
