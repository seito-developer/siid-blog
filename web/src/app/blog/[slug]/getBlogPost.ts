import {
  BLOG_API_ENDPOINT,
  BLOG_API_BASE,
  blogCacheTag,
} from "@/app/constants";
import { ArticleContentProps } from "@/interfaces/common";
import { withRetry } from "@/libs/retry";
import { isPublished } from "@/libs/published";
import { notFound } from "next/navigation";

// microCMSから特定の記事を取得。存在しない記事（削除済み含む）は 404 ページを表示する。
// draftKey を渡すと下書きを取得する（プレビュー用。キャッシュには載せない）
export async function getBlogPost(
  slug: string,
  draftKey?: string
): Promise<ArticleContentProps> {
  const post = await fetchBlogPost(slug, draftKey);
  if (post === null || !isPublishedOrPreview(post, draftKey)) {
    notFound();
  }
  return post;
}

// 公開ページとして表示してよいか（Issue #101）。
// API キーに下書き取得権限があると未公開記事も 200 で返ってくるため、
// プレビュー（draftKey あり）以外では publishedAt の無い記事を 404 扱いにする
export function isPublishedOrPreview(
  post: { publishedAt?: string | null },
  draftKey?: string
): boolean {
  return Boolean(draftKey) || isPublished(post);
}

// 記事を取得する。microCMS が 404 を返した場合は null を返す。
// 429 / 5xx は指数バックオフでリトライする（#104。sitemap と共通の withRetry を使用）
async function fetchBlogPost(
  slug: string,
  draftKey?: string
): Promise<ArticleContentProps | null> {
  if (!BLOG_API_BASE || !BLOG_API_ENDPOINT || !process.env.MICROCMS_API_KEY) {
    throw new Error("any keys are missing");
  }
  const apiKey = process.env.MICROCMS_API_KEY;

  const url = new URL(`${BLOG_API_BASE}/${BLOG_API_ENDPOINT}/${slug}`);
  if (draftKey) {
    url.searchParams.set("draftKey", draftKey);
  }

  try {
    return await withRetry(
      async () => {
        const res = await fetch(url, {
          headers: {
            "X-MICROCMS-API-KEY": apiKey,
          },
          ...(draftKey
            ? // 下書きプレビューはキャッシュに載せず毎回取得する
              { cache: "no-store" as const }
            : {
                // 記事ごとの再検証タグ（このタグ名で revalidateTag を呼ぶ）
                next: { tags: [blogCacheTag(slug)] },
                // 通常はISRキャッシュに乗せる（no-storeは付けない）
              }),
        });

        if (res.status === 404) {
          return null;
        }
        if (!res.ok) {
          // ステータスを含める（withRetry が 429 / 5xx を判定するため）
          throw new Error(`Failed to fetch blog post: ${slug} (status ${res.status})`);
        }
        return (await res.json()) as ArticleContentProps;
      },
      { label: `blog post ${slug}` }
    );
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    throw new Error(`Blog post with id ${slug} could not be fetched`, { cause: error });
  }
}
