import { describe, expect, it } from "vitest";
import { buildArticleContent, inlineCtaSegmentIndex } from "./article-content";

describe("inlineCtaSegmentIndex", () => {
  it("セグメントが4未満なら挿入しない（null）", () => {
    expect(inlineCtaSegmentIndex(0)).toBeNull();
    expect(inlineCtaSegmentIndex(1)).toBeNull();
    expect(inlineCtaSegmentIndex(3)).toBeNull();
  });

  it("セグメントが4以上なら2番目のh2セクションの後（index 2）に挿入する", () => {
    expect(inlineCtaSegmentIndex(4)).toBe(2);
    expect(inlineCtaSegmentIndex(10)).toBe(2);
  });
});

describe("buildArticleContent", () => {
  it("h2/h3 に toc-N の id を付与し、目次項目を収集する", async () => {
    const html = [
      "<p>導入文</p>",
      "<h2>見出しA</h2>",
      "<p>本文A</p>",
      "<h3>小見出しA1</h3>",
      "<p>本文A1</p>",
      "<h2>見出しB</h2>",
      "<p>本文B</p>",
    ].join("");

    const { headings, segments } = await buildArticleContent(html);

    expect(headings).toEqual([
      { id: "toc-0", text: "見出しA", level: 2 },
      { id: "toc-1", text: "小見出しA1", level: 3 },
      { id: "toc-2", text: "見出しB", level: 2 },
    ]);

    // 付与した id が本文 HTML に含まれる
    const joined = segments.join("");
    expect(joined).toContain('id="toc-0"');
    expect(joined).toContain('id="toc-2"');
  });

  it("h2 の直前で本文をセグメントに分割する（先頭は導入部）", async () => {
    const html =
      "<p>導入</p><h2>A</h2><p>a</p><h2>B</h2><p>b</p>";
    const { segments } = await buildArticleContent(html);

    expect(segments).toHaveLength(3);
    expect(segments[0]).toContain("導入");
    expect(segments[1]).toContain(">A<");
    expect(segments[2]).toContain(">B<");
  });

  it("見出しの無い本文は1セグメント・目次なしになる", async () => {
    const { headings, segments } = await buildArticleContent(
      "<p>本文のみ</p>"
    );
    expect(headings).toEqual([]);
    expect(segments).toHaveLength(1);
  });

  it("サニタイズを必ず経由する（script は除去される）", async () => {
    const { segments } = await buildArticleContent(
      "<p>ok</p><script>alert(1)</script>"
    );
    const joined = segments.join("");
    expect(joined).not.toContain("<script>");
  });

  it("空文字でも落ちない", async () => {
    const { headings, segments } = await buildArticleContent("");
    expect(headings).toEqual([]);
    expect(segments.join("")).toBe("");
  });
});
