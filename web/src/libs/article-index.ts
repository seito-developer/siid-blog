import { client } from "@/libs/microcms";
import { fetchAllPages } from "@/libs/fetch-all-pages";
import { filterPublished } from "@/libs/published";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";

// 公開済み全記事（本文を除く）の一覧。関連記事・テーマ別まとめページで共用する。
// 記事ページごとに取得すると全記事ページのビルドで 429 を踏むため、プロセス内で使い回す（#104）

// キャッシュ時間。ビルド中は全ページで1回の取得を使い回し、
// 実行時（ISR）は古くなりすぎないよう取り直す
const INDEX_TTL_MS = 60 * 60 * 1000;

let indexCache: { expiresAt: number; articles: Promise<ArticleProps[]> } | null =
  null;

export function getArticleIndex(): Promise<ArticleProps[]> {
  const now = Date.now();
  if (!indexCache || indexCache.expiresAt <= now) {
    const articles = fetchAllPages(
      (offset, limit) =>
        client.getList<ArticleProps>({
          endpoint: BLOG_API_ENDPOINT,
          queries: {
            fields:
              "id,title,publishedAt,category,categories,eyecatch,thumbnailPreset,author",
            offset,
            limit,
          },
        }),
      { label: "article index" }
    ).then(filterPublished);
    indexCache = { expiresAt: now + INDEX_TTL_MS, articles };
    // 失敗した取得はキャッシュせず、次の呼び出しで取り直す
    articles.catch(() => {
      if (indexCache?.articles === articles) {
        indexCache = null;
      }
    });
  }
  return indexCache.articles;
}
