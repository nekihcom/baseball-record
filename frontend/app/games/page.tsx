import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">試合一覧</h1>
        <p className="text-muted-foreground">
          試合情報を検索・フィルタ・ソートして表示します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>試合データ</CardTitle>
          <CardDescription>検索・フィルタ機能は実装中です</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ここに試合一覧が表示されます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
