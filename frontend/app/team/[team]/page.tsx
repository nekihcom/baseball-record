"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ team: string }> };

export default function TeamDetailPage({ params }: Props) {
  const router = useRouter();
  const [teamKey, setTeamKey] = useState<string>("");
  const [teamInfo, setTeamInfo] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setTeamKey(resolvedParams.team);
    });
  }, [params]);

  useEffect(() => {
    if (!teamKey) return;

    async function fetchTeam() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("master_teams_info")
          .select("*")
          .eq("key", teamKey)
          .eq("delete_flg", 0)
          .single();

        if (fetchError) {
          setError(fetchError.message);
          setTeamInfo(null);
          return;
        }

        setTeamInfo(data as Team);
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
        setTeamInfo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [teamKey]);

  const handleBack = () => {
    if (typeof window !== "undefined" && document.referrer) {
      const referrerUrl = new URL(document.referrer);
      const currentUrl = new URL(window.location.href);
      if (referrerUrl.origin === currentUrl.origin) {
        router.back();
        return;
      }
    }
    router.push("/team");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-base text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
        <Card className="border-none shadow-none">
          <CardHeader />
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teamInfo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            戻る
          </Button>
        </div>
        <Card className="border-none shadow-none">
          <CardHeader />
          <CardContent>
            <p className="text-muted-foreground">チームが見つかりませんでした</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-0">
        <Button onClick={handleBack} variant="outline" size="sm">
          戻る
        </Button>
      </div>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl">
            {teamInfo.team_name ?? teamInfo.team ?? teamKey ?? "—"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {/* 今後ここにチーム成績などを追加 */}
        </CardContent>
      </Card>
    </div>
  );
}
