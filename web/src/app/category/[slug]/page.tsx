import { client } from "@/libs/microcms";
import {
  BLOG_API_ENDPOINT,
  POSTS_NUM_PER_PAGE,
  SITE_URL,
} from "@/app/constants";
import JsonLd from "@/components/json-ld";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";
import Breadcrumbs from "@/components/breadcrumbs";
import { findCategoryBySlug, Category } from "../categories";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

// page パラメータを 1 以上の整数に正規化する（0・負数・数値以外は 1 扱い）
function normalizePage(page: string | undefined): number {
  const parsed = parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

// URL スラッグから対象カテゴリと offset を解決する（未知のスラッグは 404）
async function resolveRequest({ params, searchParams }: Props): Promise<{
  category: Category;
  offset: number;
}> {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = findCategoryBySlug(slug);
  if (!category) {
    notFound();
  }
  return {
    category,
    offset: (normalizePage(page) - 1) * POSTS_NUM_PER_PAGE,
  };
}

// カテゴリ別の記事一覧ページ
export default async function CategoryPage(props: Props) {
  const { category, offset } = await resolveRequest(props);
  const { posts, totalCount } = await getBlogPostsByCategory(
    category.id,
    offset,
    POSTS_NUM_PER_PAGE
  );

  // 記事が1件も無いカテゴリは404
  if (totalCount === 0) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${SITE_URL}/category/${category.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs items={[{ label: category.name, isCurrentPage: true }]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#214a4a" }}>
            {category.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            「{category.name}」の記事一覧: {totalCount}件
          </p>
        </div>
        <ArticleManager articles={posts} totalCount={totalCount} />
      </div>
    </main>
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category } = await resolveRequest(props);
  const title = `${category.name}の記事一覧 | SiiD BLOG`;
  const description = `プログラミングスクールSiiDのブログメディア。「${category.name}」に関する記事の一覧です。`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${category.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

// microCMSから指定カテゴリの記事を取得。
// cache() で同一リクエスト内の重複取得を防ぐ
const getBlogPostsByCategory = cache(
  async (
    categoryId: string,
    offset: number,
    limit: number
  ): Promise<{ posts: ArticleProps[]; totalCount: number }> => {
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: {
        offset,
        limit,
        orders: "-publishedAt",
        // 現行スキーマの複数参照フィールドで絞り込む。
        // microCMS で単一参照フィールド category へ移行した際は
        // `category[equals]${categoryId}` に変更すること（Issue #12）
        filters: `categories[contains]${categoryId}`,
      },
    });
    return {
      posts: data.contents,
      totalCount: data.totalCount,
    };
  }
);
