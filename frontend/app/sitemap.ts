import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const BASE_URL = "https://baseball-record-bi.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/game`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const supabase = createServerSupabaseClient();
  if (!supabase) return staticRoutes;

  const { data: teams } = await supabase
    .from("master_teams_info")
    .select("key")
    .eq("delete_flg", 0);

  const teamRoutes: MetadataRoute.Sitemap = (teams ?? []).flatMap((team) => [
    {
      url: `${BASE_URL}/team/${team.key}/stats`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/team/${team.key}/player`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);

  return [...staticRoutes, ...teamRoutes];
}
