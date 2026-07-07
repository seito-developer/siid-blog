import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT, POSTS_NUM_PER_PAGE } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";
import Breadcrumbs from "@/components/breadcrumbs";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

// microCMS のコンテンツ ID 形式のみ許可する（filters 文字列への
// クエリ演算子の注入を防ぐため。形式外は 404）
const CATEGORY_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

// page パラメータを 1 以上の整数に正規化する（0・負数・数値以外は 1 扱い）
function normalizePage(page: string | undefined): number {
  const parsed = parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

// カテゴリ別の記事一覧ページ
export default async function CategoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page } = await searchParams;
  if (!CATEGORY_ID_PATTERN.test(id)) {
    notFound();
  }
  const limit = POSTS_NUM_PER_PAGE;
  const offset = (normalizePage(page) - 1) * limit;

  const { posts, totalCount } = await getBlogPostsByCategory(id, offset, limit);

  // 記事が1件も無いカテゴリ（存在しないIDを含む）は404
  if (totalCount === 0) {
    notFound();
  }

  const categoryName = resolveCategoryName(posts, id);

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      <Breadcrumbs items={[{ label: categoryName, isCurrentPage: true }]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#214a4a" }}>
            {categoryName}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            「{categoryName}」の記事一覧: {totalCount}件
          </p>
        </div>
        <ArticleManager articles={posts} totalCount={totalCount} />
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const { page } = await searchParams;
  if (!CATEGORY_ID_PATTERN.test(id)) {
    notFound();
  }
  const limit = POSTS_NUM_PER_PAGE;
  const offset = (normalizePage(page) - 1) * limit;

  // ページ本体と同じ引数で呼ぶことで cache() により1リクエストに共有される
  const { posts, totalCount } = await getBlogPostsByCategory(id, offset, limit);
  if (totalCount === 0) {
    notFound();
  }

  const categoryName = resolveCategoryName(posts, id);
  const title = `${categoryName}の記事一覧 | SiiD BLOG`;
  const description = `プログラミングスクールSiiDのブログメディア。「${categoryName}」に関する記事の一覧です。`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

// カテゴリ名は記事が持つカテゴリ情報から取得する（カテゴリ単体のAPIは無い）
function resolveCategoryName(posts: ArticleProps[], id: string): string {
  return (
    posts
      .flatMap((post) => post.categories)
      .find((category) => category.id === id)?.name || id
  );
}

// microCMSから指定カテゴリの記事を取得。
// cache() で同一リクエスト内（ページ本体と generateMetadata）の重複取得を防ぐ
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
        filters: `categories[contains]${categoryId}`,
      },
    });
    return {
      posts: data.contents,
      totalCount: data.totalCount,
    };
  }
);
