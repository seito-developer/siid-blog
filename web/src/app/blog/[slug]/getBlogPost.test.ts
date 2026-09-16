import { describe, expect, it } from "vitest";
import { isPublishedOrPreview } from "./getBlogPost";

describe("isPublishedOrPreview", () => {
  it("公開済み記事は draftKey 無しで表示できる", () => {
    expect(
      isPublishedOrPreview({ publishedAt: "2026-09-01T00:00:00.000Z" })
    ).toBe(true);
  });

  it("下書き（publishedAt 無し）は draftKey 無しでは 404 扱い", () => {
    expect(isPublishedOrPreview({ publishedAt: null })).toBe(false);
    expect(isPublishedOrPreview({})).toBe(false);
  });

  it("プレビュー（draftKey あり）なら下書きも表示できる", () => {
    expect(isPublishedOrPreview({ publishedAt: null }, "dk")).toBe(true);
    expect(isPublishedOrPreview({}, "dk")).toBe(true);
  });
});
