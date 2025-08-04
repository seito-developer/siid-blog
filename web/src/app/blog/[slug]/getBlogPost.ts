import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleContentProps } from "@/interfaces/common";
import { client } from "@/libs/microcms";

// microCMSから特定の記事を取得
export async function getBlogPost(slug: string): Promise<ArticleContentProps> {
  try {
    const data = await client.get({
      endpoint: `${BLOG_API_ENDPOINT}/${slug}`,
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error fetching blog post ${slug}:`, error);
      
      // Rate limit エラーの場合は少し待って再試行
      if (error.message?.includes('429') || error.message?.includes('Too many requests')) {
        console.log(`Rate limited, waiting 1 second before retry for ${slug}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
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
