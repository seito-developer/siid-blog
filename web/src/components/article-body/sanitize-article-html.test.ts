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

describe("sanitizeArticleHtml: 動画埋め込み (iframe)", () => {
  // microCMS のリッチエディタが出力する YouTube 埋め込みの実形式
  const youtubeEmbed =
    '<div style="position: relative; padding-bottom: 56.25%;">' +
    '<iframe src="https://www.youtube.com/embed/zOtDiXqUkiI?rel=0"' +
    ' style="position: absolute;" allowfullscreen scrolling="no"' +
    ' allow="encrypted-media *;" referrerpolicy="strict-origin"></iframe></div>';

  it("YouTube の iframe を保持する（src・allowfullscreen 等）", () => {
    const result = sanitizeArticleHtml(youtubeEmbed);
    expect(result).toContain("<iframe");
    expect(result).toContain(
      'src="https://www.youtube.com/embed/zOtDiXqUkiI?rel=0"'
    );
    expect(result).toContain("allowfullscreen");
  });

  it("iframe のインライン style は除去する（表示は CSS で担保）", () => {
    const result = sanitizeArticleHtml(youtubeEmbed);
    expect(result).not.toContain("style=");
  });

  it("許可ホスト以外の iframe はタグごと除去する", () => {
    const result = sanitizeArticleHtml(
      '<iframe src="https://evil.example.com/embed/x"></iframe>'
    );
    expect(result).not.toContain("<iframe");
    expect(result).not.toContain("evil.example.com");
  });

  it("https 以外のスキームの iframe を除去する", () => {
    const result = sanitizeArticleHtml(
      '<iframe src="http://www.youtube.com/embed/x"></iframe>'
    );
    expect(result).not.toContain("<iframe");
  });

  it("不許可の埋め込みを除去した後、空のラッパー div を残さない", () => {
    const result = sanitizeArticleHtml(
      '<p>before</p><div style="position:relative"><iframe src="https://evil.example.com/embed"></iframe></div><p>after</p>'
    );
    expect(result).toBe("<p>before</p><p>after</p>");
  });

  it("画像だけを含む div は除去しない", () => {
    const result = sanitizeArticleHtml(
      '<div><img src="https://example.com/a.png" alt="x"></div>'
    );
    expect(result).toContain("<img");
    expect(result).toContain("<div>");
  });

  it("youtube-nocookie / Vimeo の iframe は許可する", () => {
    expect(
      sanitizeArticleHtml(
        '<iframe src="https://www.youtube-nocookie.com/embed/x"></iframe>'
      )
    ).toContain("<iframe");
    expect(
      sanitizeArticleHtml(
        '<iframe src="https://player.vimeo.com/video/123"></iframe>'
      )
    ).toContain("<iframe");
  });

  it("ホスト名の偽装（サブドメイン・ユーザー情報付き）を許可しない", () => {
    expect(
      sanitizeArticleHtml(
        '<iframe src="https://www.youtube.com.evil.com/embed/x"></iframe>'
      )
    ).not.toContain("<iframe");
    expect(
      sanitizeArticleHtml(
        '<iframe src="https://www.youtube.com@evil.com/embed/x"></iframe>'
      )
    ).not.toContain("<iframe");
  });
});

describe("sanitizeArticleHtml: 本文画像の最適化", () => {
  const microcmsImg =
    '<img src="https://images.microcms-assets.io/assets/abc/def/photo.png" alt="図">';

  it("すべての img に loading=lazy と decoding=async を付与する", () => {
    const result = sanitizeArticleHtml(microcmsImg);
    expect(result).toContain('loading="lazy"');
    expect(result).toContain('decoding="async"');
  });

  it("microCMS 画像には WebP 変換・リサイズのパラメータと srcset / sizes を付与する", () => {
    const result = sanitizeArticleHtml(microcmsImg);
    expect(result).toContain("w=1280");
    expect(result).toContain("fm=webp");
    expect(result).toContain("srcset=");
    expect(result).toContain("640w");
    expect(result).toContain("1280w");
    expect(result).toContain("sizes=");
  });

  it("microCMS 以外の画像の src は変更しない", () => {
    const result = sanitizeArticleHtml(
      '<img src="https://example.com/a.png" alt="x">'
    );
    expect(result).toContain('src="https://example.com/a.png"');
    expect(result).not.toContain("srcset=");
    // lazy loading は付与される
    expect(result).toContain('loading="lazy"');
  });

  it("既存のクエリパラメータがあっても壊さず上書きする", () => {
    const result = sanitizeArticleHtml(
      '<img src="https://images.microcms-assets.io/assets/a/b/c.png?width=100" alt="">'
    );
    expect(result).toContain("width=100");
    expect(result).toContain("fm=webp");
  });
});
