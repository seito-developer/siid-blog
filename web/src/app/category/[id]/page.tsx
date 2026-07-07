import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT, POSTS_NUM_PER_PAGE } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";
import Breadcrumbs from "@/components/breadcrumbs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

// カテゴリ別の記事一覧ページ
export default async function CategoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page } = await searchParams;
  const limit = POSTS_NUM_PER_PAGE;
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0;

  const { posts, totalCount } = await getBlogPostsByCategory({
    categoryId: id,
    offset,
    limit,
  });

  // 記事が1件も無いカテゴリ（存在しないIDを含む）は404
  if (totalCount === 0) {
    notFound();
  }

  // カテゴリ名は記事が持つカテゴリ情報から取得する（カテゴリ単体のAPIは無い）
  const categoryName =
    posts
      .flatMap((post) => post.categories)
      .find((category) => category.id === id)?.name || id;

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { posts } = await getBlogPostsByCategory({
    categoryId: id,
    offset: 0,
    limit: 1,
  });
  const categoryName =
    posts
      .flatMap((post) => post.categories)
      .find((category) => category.id === id)?.name || id;
  const title = `${categoryName}の記事一覧 | SiiD BLOG`;
  const description = `プログラミングスクールSiiDのブログメディア。「${categoryName}」に関する記事の一覧です。`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

// microCMSから指定カテゴリの記事を取得
async function getBlogPostsByCategory({
  categoryId,
  offset,
  limit,
}: {
  categoryId: string;
  offset: number;
  limit: number;
}): Promise<{ posts: ArticleProps[]; totalCount: number }> {
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
