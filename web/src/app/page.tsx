import { client } from "../libs/microcms";
import { BLOG_API_ENDPOINT, POSTS_NUM_PER_PAGE } from "./constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; perPage?: string };
}) {
  const { page, perPage } = searchParams;
  const limit =
    typeof perPage === "string" ? parseInt(perPage) : POSTS_NUM_PER_PAGE;
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0;

  const { posts, totalCount } = await getBlogPosts({
    offset,
    limit,
  });

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#F4F4F4",
        fontFamily: "Noto Sans JP, sans-serif",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#214a4a" }}>
            記事一覧
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Web開発、デザイン、UXに関する最新の記事をお届けします
          </p>
        </div>
        
        {page && <p>Page: {page}</p>}

        <ArticleManager articles={posts} totalCount={totalCount} />
      </div>
    </main>
  );
}

// microCMSからブログ記事を取得
export async function getBlogPosts({
  offset = 0,
  limit = POSTS_NUM_PER_PAGE,
}: {
  offset?: number;
  limit?: number;
}): Promise<{ posts: ArticleProps[]; totalCount: number }> {
  const data = await client.get({
    endpoint: BLOG_API_ENDPOINT, // 'blog'はmicroCMSのエンドポイント名
    queries: {
      offset: offset,
      limit: limit,
      orders: "-publishedAt", // 新しい順に取得
    },
  });
  return {
    posts: data.contents,
    totalCount: data.totalCount,
  };
}
