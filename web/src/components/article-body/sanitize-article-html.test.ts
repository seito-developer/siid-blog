import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "./sanitize-article-html";

describe("sanitizeArticleHtml", () => {
  it("許可タグ（p, strong, img 等）はそのまま残す", () => {
    const html = '<p>本文<strong>強調</strong></p><img src="https://example.com/a.png" alt="画像">';
    const result = sanitizeArticleHtml(html);
    expect(result).toContain("<p>本文<strong>強調</strong></p>");
    expect(result).toContain('<img src="https://example.com/a.png" alt="画像"');
  });

  it("script タグは実行されない形にエスケープする（XSS対策）", () => {
    const result = sanitizeArticleHtml('<p>a</p><script>alert(1)</script>');
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("onclick 等のイベントハンドラ属性を除去する", () => {
    const result = sanitizeArticleHtml('<p onclick="alert(1)">click</p>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("<p>click</p>");
  });

  it("javascript: スキームの href を除去する", () => {
    const result = sanitizeArticleHtml('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("javascript:");
  });

  it("外部リンクには target=_blank と rel=noopener noreferrer を付与する", () => {
    const result = sanitizeArticleHtml('<a href="https://example.com/">external</a>');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("内部リンクには target / rel を付けない", () => {
    const result = sanitizeArticleHtml('<a href="/blog/xyz" target="_blank">internal</a>');
    expect(result).not.toContain("target=");
    expect(result).not.toContain("rel=");
  });

  it("class 以外の未許可属性（style 等)を除去する", () => {
    const result = sanitizeArticleHtml('<div class="box" style="color:red">x</div>');
    expect(result).toContain('class="box"');
    expect(result).not.toContain("style=");
  });
});
