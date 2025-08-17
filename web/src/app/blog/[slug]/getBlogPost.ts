import { BLOG_API_ENDPOINT, BLOG_API_BASE } from "@/app/constants";
import { ArticleContentProps } from "@/interfaces/common";
import { client } from "@/libs/microcms";

// microCMSから特定の記事を取得
export async function getBlogPost(slug: string): Promise<ArticleContentProps> {
  try {
    if (
      !BLOG_API_BASE ||
      !BLOG_API_ENDPOINT ||
      !process.env.NEXT_PUBLIC_MICROCMS_API_KEY
    ) {
      throw new Error("any keys are missing");
    }

    const url = `${BLOG_API_BASE}/${BLOG_API_ENDPOINT}/${slug}`;
    const res = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": process.env.NEXT_PUBLIC_MICROCMS_API_KEY,
      },
      // 記事ごとの再検証タグ（このタグ名で revalidateTag を呼ぶ）
      next: { tags: [`blog-${slug}`] },
      // 通常はISRキャッシュに乗せる（no-storeは付けない）
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch blog post: ${slug}`);
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
