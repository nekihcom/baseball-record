import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">選手一覧</h1>
        <p className="text-muted-foreground">
          選手成績を検索・フィルタ・ソートして表示します
        </p>
      </div>

      <Tabs defaultValue="hitter" className="w-full">
        <TabsList>
          <TabsTrigger value="hitter">打者成績</TabsTrigger>
          <TabsTrigger value="pitcher">投手成績</TabsTrigger>
        </TabsList>
        <TabsContent value="hitter">
          <Card>
            <CardHeader>
              <CardTitle>打者成績</CardTitle>
              <CardDescription>検索・フィルタ機能は実装中です</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ここに打者成績が表示されます
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pitcher">
          <Card>
            <CardHeader>
              <CardTitle>投手成績</CardTitle>
              <CardDescription>検索・フィルタ機能は実装中です</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ここに投手成績が表示されます
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
