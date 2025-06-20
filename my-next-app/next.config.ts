import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
