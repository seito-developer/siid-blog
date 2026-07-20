import { describe, expect, it } from "vitest";
import { withUtm } from "./utm";

describe("withUtm", () => {
  it("UTM 4パラメータを付与する", () => {
    const url = withUtm("https://bug-fix.org/siid/counseling", {
      campaign: "my-article",
      content: "article_bottom_counseling",
    });
    const u = new URL(url);
    expect(u.searchParams.get("utm_source")).toBe("blog");
    expect(u.searchParams.get("utm_medium")).toBe("cta");
    expect(u.searchParams.get("utm_campaign")).toBe("my-article");
    expect(u.searchParams.get("utm_content")).toBe("article_bottom_counseling");
    expect(u.origin + u.pathname).toBe("https://bug-fix.org/siid/counseling");
  });

  it("既存のクエリパラメータを保持する", () => {
    const url = withUtm("https://example.com/lp?ref=abc", {
      campaign: "slug",
      content: "pos",
    });
    const u = new URL(url);
    expect(u.searchParams.get("ref")).toBe("abc");
    expect(u.searchParams.get("utm_campaign")).toBe("slug");
  });

  it("日本語を含む campaign も URL エンコードされて壊れない", () => {
    const url = withUtm("https://example.com/", {
      campaign: "記事",
      content: "pos",
    });
    expect(new URL(url).searchParams.get("utm_campaign")).toBe("記事");
  });
});
