import { Suspense } from "react";
import { GameList } from "@/components/GameList";

export default function GamesPage() {
  return (
    <div className="space-y-3">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">読み込み中...</div>}>
        <GameList />
      </Suspense>
    </div>
  );
}
