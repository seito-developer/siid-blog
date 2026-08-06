import { describe, expect, it } from "vitest";
import { blogCacheTag } from "./constants";

describe("blogCacheTag", () => {
  it("記事取得側と revalidate 側で共有するタグ形式 blog-<id> を生成する", () => {
    expect(blogCacheTag("abc123")).toBe("blog-abc123");
  });
});
