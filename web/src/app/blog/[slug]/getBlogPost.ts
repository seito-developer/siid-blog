import {
  BLOG_API_ENDPOINT,
  BLOG_API_BASE,
  blogCacheTag,
} from "@/app/constants";
import { ArticleContentProps } from "@/interfaces/common";
import { client } from "@/libs/microcms";
import { notFound } from "next/navigation";

// microCMSから特定の記事を取得。存在しない記事（削除済み含む）は 404 ページを表示する
export async function getBlogPost(slug: string): Promise<ArticleContentProps> {
  const post = await fetchBlogPost(slug);
  if (post === null) {
    notFound();
  }
  return post;
}

// 記事を取得する。microCMS が 404 を返した場合は null を返す
async function fetchBlogPost(
  slug: string
): Promise<ArticleContentProps | null> {
  try {
    if (
      !BLOG_API_BASE ||
      !BLOG_API_ENDPOINT ||
      !process.env.MICROCMS_API_KEY
    ) {
      throw new Error("any keys are missing");
    }

    const url = `${BLOG_API_BASE}/${BLOG_API_ENDPOINT}/${slug}`;
    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY,
      },
      // 記事ごとの再検証タグ（このタグ名で revalidateTag を呼ぶ）
      next: { tags: [blogCacheTag(slug)] },
      // 通常はISRキャッシュに乗せる（no-storeは付けない）
    });

    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      // ステータスを含める（429 の場合に下の catch でリトライ判定するため）
      throw new Error(`Failed to fetch blog post: ${slug} (status ${res.status})`);
    }
    return res.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error fetching blog post ${slug}:`, error);

      // Rate limit エラーの場合は少し待って再試行
      if (
        error.message?.includes("429") ||
        error.message?.includes("Too many requests")
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          const data = await client.get({
            endpoint: `${BLOG_API_ENDPOINT}/${slug}`,
          });
          return data;
        } catch (retryError) {
          console.error(`Retry failed for blog post ${slug}:`, retryError);
          throw new Error(`Blog post with id ${slug} not found after retry`);
        }
      }
    }

    throw new Error(`Blog post with id ${slug} not found`);
  }
}
