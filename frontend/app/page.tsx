import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">野球記録ダッシュボード</h1>
        <p className="text-muted-foreground">
          Supabaseに保存された野球記録データを表示・検索できます
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>試合一覧</CardTitle>
            <CardDescription>試合情報を検索・閲覧</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/games">試合一覧を見る</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>選手一覧</CardTitle>
            <CardDescription>選手成績を検索・閲覧</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/players">選手一覧を見る</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>チーム一覧</CardTitle>
            <CardDescription>チーム成績を閲覧</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/teams">チーム一覧を見る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
