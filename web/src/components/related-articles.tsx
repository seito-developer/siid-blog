import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import ArticleList from "./article-list";

// 記事末の関連記事セクション（Issue #56）。
// 同カテゴリの最新3件（自分自身は除外）。カテゴリ未設定や同カテゴリに
// 他記事が無い場合は最新記事3件にフォールバックする
const RELATED_ARTICLES_LIMIT = 3;

async function getRelatedArticles(
  categoryId: string | undefined,
  currentId: string
): Promise<ArticleProps[]> {
  // 自分自身を除外する条件は全パターン共通
  const excludeSelf = `id[not_equals]${currentId}`;
  try {
    if (categoryId) {
      const data = await client.get({
        endpoint: BLOG_API_ENDPOINT,
        queries: {
          limit: RELATED_ARTICLES_LIMIT,
          orders: "-publishedAt",
          // 現行スキーマの複数参照フィールドで絞り込む（category/[slug]/page.tsx と同様）。
          // 単一参照 category へ移行した際は `category[equals]` に変更すること（Issue #12）
          filters: `categories[contains]${categoryId}[and]${excludeSelf}`,
        },
      });
      if (data.contents.length > 0) {
        return data.contents;
      }
    }
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: {
        limit: RELATED_ARTICLES_LIMIT,
        orders: "-publishedAt",
        filters: excludeSelf,
      },
    });
    return data.contents;
  } catch {
    // 関連記事の取得失敗で記事ページ全体を落とさない
    return [];
  }
}

export default async function RelatedArticles({
  categoryId,
  currentId,
}: {
  categoryId: string | undefined;
  currentId: string;
}) {
  const articles = await getRelatedArticles(categoryId, currentId);
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-bold text-[#214a4a] mb-6">関連記事</h2>
      <ArticleList articles={articles} />
    </section>
  );
}
