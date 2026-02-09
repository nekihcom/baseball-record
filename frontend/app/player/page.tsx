"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlayerListRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/team");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">リダイレクト中...</p>
    </div>
  );
}
