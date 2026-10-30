import { client } from "@/libs/microcms";
import { filterPublished } from "@/libs/published";
import { buildRssFeed, type FeedItem } from "@/libs/rss";
import { BLOG_API_ENDPOINT, SITE_NAME, SITE_URL } from "../constants";

// 1日1回再生成する（記事の公開・更新時はデプロイフックの再ビルドでも更新される）
export const revalidate = 86400;

const FEED_ITEMS_NUM = 20;

export async function GET() {
  const data = await client.getList<FeedItem & { publishedAt?: string | null }>({
    endpoint: BLOG_API_ENDPOINT,
    queries: {
      fields: "id,title,publishedAt,contents,excerpt",
      orders: "-publishedAt",
      limit: FEED_ITEMS_NUM,
    },
  });
  // 下書き取得権限のあるキーでも未公開記事を載せない（Issue #101）
  const items = filterPublished(data.contents) as FeedItem[];

  const xml = buildRssFeed(
    {
      title: SITE_NAME,
      link: SITE_URL,
      description:
        "プログラミングスクールSiiDのブログメディア「SiiD BLOG」の新着記事です。",
    },
    items
  );
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
