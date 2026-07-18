import { client } from "../libs/microcms";
import {
  BLOG_API_ENDPOINT,
  DEFAULT_OGP_IMAGE,
  POSTS_NUM_PER_PAGE,
  SITE_NAME,
  SITE_URL,
} from "./constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleManager from "@/components/article-manager";
import SearchBar from "@/components/search-bar";
import JsonLd from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事一覧 | SiiD BLOG",
  description: "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "記事一覧 | SiiD BLOG",
    description: "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
    type: "website",
    url: SITE_URL,
    // 相対パスは metadataBase で絶対 URL 化される
    images: [{ url: DEFAULT_OGP_IMAGE, width: 1200, height: 630 }],
  },
  // 指定しないと layout のサイト共通値（SiiD BLOG）が使われ og:title と食い違う
  twitter: {
    card: "summary_large_image",
    title: "記事一覧 | SiiD BLOG",
    description: "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
    images: [DEFAULT_OGP_IMAGE],
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; q?: string }>;
}) {
  const { page, perPage, q } = await searchParams;
  const limit =
    typeof perPage === "string" ? parseInt(perPage) : POSTS_NUM_PER_PAGE;
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0;
  const searchQuery = q || "";

  const { posts, totalCount } = await getBlogPosts({
    offset,
    limit,
    q: searchQuery,
  });

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    // Organization 本体は layout.tsx で出力している（Issue #59）
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#F4F4F4",
        fontFamily: "Noto Sans JP, sans-serif",
      }}
    >
      <JsonLd data={webSiteJsonLd} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#214a4a" }}>
            SiiD BLOG
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            プログラミングスクールSiiDによるブログメディア。<br />
            エンジニア転職や技術学習に関する有益な情報を発信中！
          </p>
        </div>
        
        <SearchBar />
        
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              「<span className="font-semibold text-[#214a4a]">{searchQuery}</span>」の検索結果: {totalCount}件
            </p>
          </div>
        )}

        <ArticleManager articles={posts} totalCount={totalCount} />
      </div>
    </main>
  );
}

// microCMSからブログ記事を取得
async function getBlogPosts({
  offset = 0,
  limit = POSTS_NUM_PER_PAGE,
  q = "",
}: {
  offset?: number;
  limit?: number;
  q?: string;
}): Promise<{ posts: ArticleProps[]; totalCount: number }> {
  const queries: Record<string, unknown> = {
    offset: offset,
    limit: limit,
    orders: "-publishedAt", // 新しい順に取得
  };

  // 検索クエリがある場合は追加
  if (q.trim()) {
    queries.q = q.trim();
  }

  const data = await client.get({
    endpoint: BLOG_API_ENDPOINT, // 'blog'はmicroCMSのエンドポイント名
    queries,
  });
  return {
    posts: data.contents,
    totalCount: data.totalCount,
  };
}
