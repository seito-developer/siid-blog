import { client } from "../libs/microcms";
import { BLOG_API_ENDPOINT } from "./constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";


export default async function Home() {
  const {posts, totalCount} = await getBlogPosts(0);

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
      
        <ArticleManager 
          articles={posts}
          totalCount={totalCount}
        />

      </div>
    </main>
  );
}

// microCMSからブログ記事を取得
export async function getBlogPosts(offset: number): Promise<{posts: ArticleProps[], totalCount: number}> {
  const data = await client.get({
    endpoint: BLOG_API_ENDPOINT, // 'blog'はmicroCMSのエンドポイント名
    queries: {
      offset: offset,
      limit: 10,
      orders: "-publishedAt", // 新しい順に取得
    },
  });
  return {
      posts: data.contents,
      totalCount: data.totalCount,
  };
}