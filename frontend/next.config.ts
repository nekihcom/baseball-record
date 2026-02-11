import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // ルートの package-lock.json を検出して workspace root を誤認識するのを防ぐ
    root: path.join(__dirname),
  },
};

export default nextConfig;
