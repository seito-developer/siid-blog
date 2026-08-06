import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";

// 前後記事ナビ用の取得ロジック（Issue #71）。
// 同カテゴリ内で publishedAt が現在記事の前後にある記事を1件ずつ取得する。
// - prev: 1つ古い記事（publishedAt が小さい直近）
// - next: 1つ新しい記事（publishedAt が大きい直近）
// カテゴリ未設定の記事はサイト全体の前後記事にフォールバックする。
// サムネイル表示に必要なフィールドのみ取得する。

export type AdjacentArticles = {
  prev: ArticleProps | null;
  next: ArticleProps | null;
};

const FIELDS = "id,title,eyecatch,thumbnailPreset";

async function fetchOne(filters: string, orders: string): Promise<ArticleProps | null> {
  try {
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: { limit: 1, orders, filters, fields: FIELDS },
    });
    return (data.contents[0] as ArticleProps) ?? null;
  } catch {
    // 取得失敗で記事ページ全体を落とさない
    return null;
  }
}

export async function getAdjacentArticles(
  categoryId: string | undefined,
  currentId: string,
  publishedAt: string
): Promise<AdjacentArticles> {
  if (!publishedAt) {
    return { prev: null, next: null };
  }
  // 現行スキーマの複数参照フィールドで絞り込む（related-articles.ts と同様）。
  // 単一参照 category へ移行した際は `category[equals]` に変更すること（Issue #12）
  const inCategory = categoryId ? `categories[contains]${categoryId}[and]` : "";
  const notSelf = `[and]id[not_equals]${currentId}`;

  const [prev, next] = await Promise.all([
    // 1つ古い記事（publishedAt 降順の先頭）
    fetchOne(
      `${inCategory}publishedAt[less_than]${publishedAt}${notSelf}`,
      "-publishedAt"
    ),
    // 1つ新しい記事（publishedAt 昇順の先頭）
    fetchOne(
      `${inCategory}publishedAt[greater_than]${publishedAt}${notSelf}`,
      "publishedAt"
    ),
  ]);

  return { prev, next };
}
