import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">チーム一覧</h1>
        <p className="text-sm text-muted-foreground">
          チーム情報とチーム成績を表示します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>チームデータ</CardTitle>
          <CardDescription>検索・フィルタ機能は実装中です</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ここにチーム一覧が表示されます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
