"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TeamPageRedirect() {
  const router = useRouter();
  const params = useParams();
  const team = params?.team as string | undefined;

  useEffect(() => {
    if (team) {
      router.replace(`/team/${team}/stats`);
    }
  }, [team, router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">リダイレクト中...</p>
    </div>
  );
}
