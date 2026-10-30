// RSS 2.0 フィードの組み立て（/feed.xml）。
// Google は RSS もサイトマップとして受け付けるため、新着記事を早く見つけてもらう経路として使う
import { buildArticleDescription } from "./article-description";

export type FeedItem = {
  id: string;
  title: string;
  publishedAt: string;
  contents: string;
  excerpt?: string;
};

export type FeedChannel = {
  title: string;
  link: string;
  description: string;
};

// XML の特殊文字をエスケープする。XML で使えない制御文字（Word 等からの貼り付けで混ざる）は除く。
// 1文字でも残るとフィード全体が不正な XML になり、Search Console に読まれなくなるため
export function escapeXml(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 本文 HTML からタグと主な文字参照を取り除いたテキストにする（説明文用の簡易版）
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10))
    )
    .replace(/&amp;/g, "&");
}

export function buildRssFeed(channel: FeedChannel, items: FeedItem[]): string {
  const itemXml = items
    .map((item) => {
      const url = `${channel.link}/blog/${item.id}`;
      const description = buildArticleDescription(
        item.excerpt,
        htmlToPlainText(item.contents)
      );
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    "    <language>ja</language>",
    `    <atom:link href="${escapeXml(`${channel.link}/feed.xml`)}" rel="self" type="application/rss+xml"/>`,
    itemXml,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
