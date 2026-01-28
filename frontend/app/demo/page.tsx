"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DemoTabsPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <h1 className="text-3xl font-bold mb-8">タブデザインパターン</h1>

      {/* パターン1: 一段階目 - 通常のタブ、二段階目 - アンダーライン付きタブ */}
      <Card>
        <CardHeader>
          <CardTitle>パターン1: 通常タブ / アンダーラインタブ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="current" className="flex-1">
                今シーズンの成績
              </TabsTrigger>
              <TabsTrigger value="career" className="flex-1">
                通算成績
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList variant="line" className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="career" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList variant="line" className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* パターン2: 一段階目 - ボタンスタイル、二段階目 - 通常のタブ */}
      <Card>
        <CardHeader>
          <CardTitle>パターン2: ボタンスタイル / 通常タブ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full bg-transparent border-b rounded-none p-0 h-auto">
              <TabsTrigger
                value="current"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                今シーズンの成績
              </TabsTrigger>
              <TabsTrigger
                value="career"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                通算成績
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="career" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* パターン3: 一段階目 - ピル型タブ、二段階目 - アンダーライン付きタブ */}
      <Card>
        <CardHeader>
          <CardTitle>パターン3: ピル型タブ / アンダーラインタブ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full bg-muted/50 p-1 rounded-full">
              <TabsTrigger
                value="current"
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                今シーズンの成績
              </TabsTrigger>
              <TabsTrigger
                value="career"
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                通算成績
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList variant="line" className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="career" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList variant="line" className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* パターン4: 一段階目 - セグメントコントロール風、二段階目 - 通常のタブ */}
      <Card>
        <CardHeader>
          <CardTitle>パターン4: セグメントコントロール風 / 通常タブ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full bg-transparent p-0 h-auto border rounded-lg overflow-hidden">
              <TabsTrigger
                value="current"
                className="flex-1 rounded-none border-r last:border-r-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                今シーズンの成績
              </TabsTrigger>
              <TabsTrigger
                value="career"
                className="flex-1 rounded-none border-r last:border-r-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                通算成績
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="career" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="hitter" className="flex-1">
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger value="pitcher" className="flex-1">
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* パターン5: 一段階目 - 通常のタブ、二段階目 - ピル型タブ */}
      <Card>
        <CardHeader>
          <CardTitle>パターン5: 通常タブ / ピル型タブ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="current" className="flex-1">
                今シーズンの成績
              </TabsTrigger>
              <TabsTrigger value="career" className="flex-1">
                通算成績
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList className="w-full bg-muted/50 p-1 rounded-full">
                  <TabsTrigger
                    value="hitter"
                    className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger
                    value="pitcher"
                    className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="career" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList className="w-full bg-muted/50 p-1 rounded-full">
                  <TabsTrigger
                    value="hitter"
                    className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger
                    value="pitcher"
                    className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* パターン6: 一段階目 - 通常のタブ、二段階目 - 選択時黒背景/未選択時アンダーライン */}
      <Card>
        <CardHeader>
          <CardTitle>パターン6: 通常タブ / 選択時黒背景・未選択時アンダーライン</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="current" className="flex-1">
                今シーズンの成績
              </TabsTrigger>
              <TabsTrigger value="career" className="flex-1">
                通算成績
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList variant="line" className="w-full">
                  <TabsTrigger
                    value="hitter"
                    className="flex-1 after:opacity-100 data-[state=active]:bg-[#333333] data-[state=active]:text-white data-[state=active]:after:opacity-0"
                  >
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger
                    value="pitcher"
                    className="flex-1 after:opacity-100 data-[state=active]:bg-[#333333] data-[state=active]:text-white data-[state=active]:after:opacity-0"
                  >
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="career" className="mt-4">
              <Tabs defaultValue="hitter" className="w-full">
                <TabsList variant="line" className="w-full">
                  <TabsTrigger
                    value="hitter"
                    className="flex-1 after:opacity-100 data-[state=active]:bg-[#333333] data-[state=active]:text-white data-[state=active]:after:opacity-0"
                  >
                    打者成績
                  </TabsTrigger>
                  <TabsTrigger
                    value="pitcher"
                    className="flex-1 after:opacity-100 data-[state=active]:bg-[#333333] data-[state=active]:text-white data-[state=active]:after:opacity-0"
                  >
                    投手成績
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hitter" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算打者成績の内容</p>
                </TabsContent>
                <TabsContent value="pitcher" className="mt-4">
                  <p className="text-sm text-muted-foreground">通算投手成績の内容</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
