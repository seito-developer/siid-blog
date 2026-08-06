import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";

// 関連記事の取得ロジック（Issue #56）。
// 同カテゴリの最新記事（自分自身は除外）。カテゴリ未設定や同カテゴリに
// 他記事が無い場合は最新記事にフォールバックする。
// 記事詳細の本文末（SP）とサイドバー（PC）で同じ結果を使い回すため、
// 取得はページ側で1回だけ行い、各表示コンポーネントには props で渡す。

export const RELATED_ARTICLES_LIMIT = 3;

export async function getRelatedArticles(
  categoryId: string | undefined,
  currentId: string,
  limit: number = RELATED_ARTICLES_LIMIT
): Promise<ArticleProps[]> {
  // 自分自身を除外する条件は全パターン共通
  const excludeSelf = `id[not_equals]${currentId}`;
  try {
    if (categoryId) {
      const data = await client.get({
        endpoint: BLOG_API_ENDPOINT,
        queries: {
          limit,
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
        limit,
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
