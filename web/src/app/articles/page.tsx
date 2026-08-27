import { client } from "@/libs/microcms";
import {
  BLOG_API_ENDPOINT,
  DEFAULT_OGP_IMAGE,
  POSTS_NUM_PER_PAGE,
  SITE_URL,
} from "@/app/constants";
import JsonLd from "@/components/json-ld";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";
import Breadcrumbs from "@/components/breadcrumbs";
import { cache } from "react";
import type { Metadata } from "next";

// 新着記事一覧（Issue #94）。
// TOP は「新着記事6件 + もっと見る」に役割を絞り、全件のページ送りはこのページが担う。
// 構造・ページネーションはカテゴリ一覧（/category/[slug]）と揃えている。

const PAGE_TITLE = "新着記事一覧";
const PAGE_DESCRIPTION =
  "プログラミングスクールSiiDのブログメディア「SiiD BLOG」の新着記事一覧です。";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

// page パラメータを 1 以上の整数に正規化する（0・負数・数値以外は 1 扱い）
function normalizePage(page: string | undefined): number {
  const parsed = parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const offset = (normalizePage(page) - 1) * POSTS_NUM_PER_PAGE;
  const { posts, totalCount } = await getBlogPosts(offset, POSTS_NUM_PER_PAGE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: PAGE_TITLE,
        item: `${SITE_URL}/articles`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs items={[{ label: PAGE_TITLE, isCurrentPage: true }]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#214a4a" }}>
            {PAGE_TITLE}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            全{totalCount}件
          </p>
        </div>
        <ArticleManager articles={posts} totalCount={totalCount} />
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | SiiD BLOG`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/articles` },
  openGraph: {
    title: `${PAGE_TITLE} | SiiD BLOG`,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/articles`,
    // 相対パスは metadataBase で絶対 URL 化される
    images: [{ url: DEFAULT_OGP_IMAGE, width: 1200, height: 630 }],
  },
  // 指定しないと layout のサイト共通値（SiiD BLOG）が使われ og:title と食い違う
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | SiiD BLOG`,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_OGP_IMAGE],
  },
};

// microCMS から全記事を新しい順に取得。
// cache() で同一リクエスト内の重複取得を防ぐ
const getBlogPosts = cache(
  async (
    offset: number,
    limit: number
  ): Promise<{ posts: ArticleProps[]; totalCount: number }> => {
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: { offset, limit, orders: "-publishedAt" },
    });
    return {
      posts: data.contents,
      totalCount: data.totalCount,
    };
  }
);
