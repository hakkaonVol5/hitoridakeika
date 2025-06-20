import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // ページ拡張子の設定
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // 静的生成の設定
  trailingSlash: false,
  // 環境変数の設定
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  // Vercelでの静的生成を有効化
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
