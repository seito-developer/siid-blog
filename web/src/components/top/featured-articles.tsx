import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleList from "@/components/article-list";
import {
  FEATURED_ARTICLE_IDS,
  FEATURED_ARTICLES_LIMIT,
} from "./featured-list";

// 注目記事セクション（Issue #64）。
// 手動指定 ID（featured-list.ts）を優先し、無ければ最新記事にフォールバック。
// 取得失敗・0件時はセクション非表示（return null）。
// レイアウトは新着記事と同じ3カラム（ArticleList を再利用）、表示は3件のみ。

async function getFeaturedArticles(): Promise<ArticleProps[]> {
  try {
    // 手動指定 ID があれば id で絞り込み、指定順を維持する
    if (FEATURED_ARTICLE_IDS.length > 0) {
      const filters = FEATURED_ARTICLE_IDS.map((id) => `id[equals]${id}`).join(
        "[or]"
      );
      const data = await client.get({
        endpoint: BLOG_API_ENDPOINT,
        queries: { limit: FEATURED_ARTICLE_IDS.length, filters },
      });
      const byId = new Map<string, ArticleProps>(
        (data.contents as ArticleProps[]).map((a) => [a.id, a])
      );
      const ordered = FEATURED_ARTICLE_IDS.map((id) => byId.get(id)).filter(
        (a): a is ArticleProps => Boolean(a)
      );
      if (ordered.length > 0) return ordered;
    }
    // フォールバック: 最新記事
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: { limit: FEATURED_ARTICLES_LIMIT, orders: "-publishedAt" },
    });
    return data.contents as ArticleProps[];
  } catch {
    return [];
  }
}

export default async function FeaturedArticles() {
  const articles = await getFeaturedArticles();
  if (articles.length === 0) return null;

  // 表示は3件のみ
  const featured = articles.slice(0, FEATURED_ARTICLES_LIMIT);

  return (
    <section aria-labelledby="featured-heading" className="py-4">
      <h2
        id="featured-heading"
        className="mb-6 text-2xl font-bold text-[#214a4a]"
      >
        注目記事
      </h2>
      {/* 新着記事と同じ3カラムグリッド。セクション h2 配下なのでカード見出しは h3 */}
      <ArticleList articles={featured} headingLevel="h3" />
    </section>
  );
}
