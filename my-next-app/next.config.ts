import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Vercelでの静的生成を有効化
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
