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

// 重複していた移行記事を統合した旧記事 ID → 統合先の記事 ID（Issue #120）。
// インデックス済みの記事の評価を引き継ぐため 301 リダイレクトする
const MERGED_ARTICLE_REDIRECTS: Record<string, string> = {
  "40": "12",
  "33": "64",
};

const nextConfig: NextConfig = {
  // ビルド時の静的生成で microCMS へのリクエストが集中し 429 でビルドが落ちるため、
  // ワーカー数と同時生成数を絞る（#104。既定は CPU数-1 ワーカー × 8 並列）
  experimental: { cpus: 2, staticGenerationMaxConcurrency: 4 },
  images: {
    remotePatterns: [new URL('https://images.microcms-assets.io/assets/**')],
  },
  async redirects() {
    return [
      ...Object.entries(REMOVED_CATEGORY_REDIRECTS).map(([oldSlug, newSlug]) => ({
        source: `/category/${oldSlug}`,
        destination: `/category/${newSlug}`,
        permanent: true,
      })),
      ...Object.entries(MERGED_ARTICLE_REDIRECTS).map(([oldId, newId]) => ({
        source: `/blog/${oldId}`,
        destination: `/blog/${newId}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
