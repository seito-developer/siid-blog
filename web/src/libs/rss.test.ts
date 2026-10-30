import { describe, expect, it } from "vitest";
import { buildRssFeed, escapeXml, htmlToPlainText } from "./rss";

const channel = {
  title: "SiiD BLOG",
  link: "https://example.com",
  description: "説明",
};

describe("escapeXml", () => {
  it("XML の特殊文字をエスケープする", () => {
    expect(escapeXml(`<a href="x">Q&A's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Q&amp;A&apos;s&lt;/a&gt;"
    );
  });
});

describe("htmlToPlainText", () => {
  it("タグを除き、文字参照を戻す", () => {
    expect(htmlToPlainText("<p>A&amp;B&nbsp;<b>C</b></p>").trim()).toBe(
      "A&B  C"
    );
  });
});

describe("buildRssFeed", () => {
  const xml = buildRssFeed(channel, [
    {
      id: "pandas-drop",
      title: "pandas で列を削除する <方法>",
      publishedAt: "2026-10-21T17:15:13.277Z",
      contents: "<p>本文です。</p>",
    },
  ]);

  it("記事ごとに item を出し、URL を link と guid に入れる", () => {
    expect(xml).toContain("<link>https://example.com/blog/pandas-drop</link>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://example.com/blog/pandas-drop</guid>'
    );
  });

  it("タイトルをエスケープし、本文から説明文を作る", () => {
    expect(xml).toContain("<title>pandas で列を削除する &lt;方法&gt;</title>");
    expect(xml).toContain("<description>本文です。</description>");
  });

  it("pubDate を RFC 822 形式で出す", () => {
    expect(xml).toContain("<pubDate>Wed, 21 Oct 2026 17:15:13 GMT</pubDate>");
  });
});
