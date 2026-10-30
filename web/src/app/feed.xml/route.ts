import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { client } from "@/libs/microcms";
import { withRetry } from "@/libs/retry";
import { filterPublished } from "@/libs/published";
import { buildRssFeed, type FeedItem } from "@/libs/rss";
import { BLOG_API_ENDPOINT, SITE_NAME, SITE_URL } from "../constants";

// 1日1回再生成する（記事の公開・更新時はデプロイフックの再ビルドでも更新される）
export const revalidate = 86400;

const FEED_ITEMS_NUM = 20;

export async function GET() {
  let items: FeedItem[];
  try {
    const data = await withRetry(
      () =>
        client.getList<FeedItem & { publishedAt?: string | null }>({
          endpoint: BLOG_API_ENDPOINT,
          queries: {
            fields: "id,title,publishedAt,contents,excerpt",
            orders: "-publishedAt",
            limit: FEED_ITEMS_NUM,
          },
        }),
      { label: "feed" }
    );
    // 下書き取得権限のあるキーでも未公開記事を載せない（Issue #101）
    items = filterPublished(data.contents) as FeedItem[];
  } catch (error) {
    console.error("[feed] microCMS から記事一覧を取得できませんでした:", error);
    // sitemap と同じく、ビルド中は空のフィードで続行してデプロイ全体を落とさない（#104）。
    // 実行時（ISR の再生成）は throw して、前回生成済みのフィードを配信し続けてもらう
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
      throw error;
    }
    items = [];
  }

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
