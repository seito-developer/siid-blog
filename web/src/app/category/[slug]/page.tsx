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
import { findCategoryBySlug, Category } from "../categories";
import {
  normalizePage,
  pagedTitle,
  pagedUrl,
  pageToOffset,
} from "@/libs/pagination";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

// URL スラッグから対象カテゴリと offset を解決する（未知のスラッグは 404）
async function resolveRequest({ params, searchParams }: Props): Promise<{
  category: Category;
  currentPage: number;
  offset: number;
}> {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = findCategoryBySlug(slug);
  if (!category) {
    notFound();
  }
  const currentPage = normalizePage(page);
  return {
    category,
    currentPage,
    offset: pageToOffset(currentPage, POSTS_NUM_PER_PAGE),
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

  // 記事が1件も無いカテゴリ、および範囲外のページ（?page=99999 等）は404
  // （空グリッド + 誤ったページ番号が出てしまうため）
  if (posts.length === 0) {
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
    <main className="min-h-screen bg-siid-bg">
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs items={[{ label: category.name, isCurrentPage: true }]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-siid-text)" }}>
            {category.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            「{category.name}」の記事一覧: {totalCount}件
          </p>
        </div>
        <ArticleManager
          articles={posts}
          totalCount={totalCount}
          itemsPerPage={POSTS_NUM_PER_PAGE}
        />
      </div>
    </main>
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category, currentPage } = await resolveRequest(props);
  const title = `${pagedTitle(`${category.name}の記事一覧`, currentPage)} | SiiD BLOG`;
  // 2ページ目以降は自分自身を canonical にする（1ページ目に寄せると古い記事への経路が評価されない）
  const url = pagedUrl(`${SITE_URL}/category/${category.slug}`, currentPage);
  const description = `プログラミングスクールSiiDのブログメディア。「${category.name}」に関する記事の一覧です。`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      // 相対パスは metadataBase で絶対 URL 化される
      images: [{ url: DEFAULT_OGP_IMAGE, width: 1200, height: 630 }],
    },
    // 指定しないと layout のサイト共通値（SiiD BLOG）が使われ og:title と食い違う
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OGP_IMAGE],
    },
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
