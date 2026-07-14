import type { NextConfig } from "next";

// 旧カテゴリ（Issue #51 で統合・削除）の URL は統合先へ 301 リダイレクト（SEO 継続性のため）
const REMOVED_CATEGORY_REDIRECTS: Record<string, string> = {
  javascript: "programming",
  typescript: "programming",
  python: "programming",
  html: "programming",
  docker: "programming",
  aws: "programming",
  flutter: "programming",
  storybook: "programming",
  excel: "programming",
  spreadsheets: "programming",
  vba: "programming",
  gas: "programming",
  "job-change": "career",
  uncategorized: "column",
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://images.microcms-assets.io/assets/**')],
  },
  async redirects() {
    return Object.entries(REMOVED_CATEGORY_REDIRECTS).map(([oldSlug, newSlug]) => ({
      source: `/category/${oldSlug}`,
      destination: `/category/${newSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
