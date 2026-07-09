import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  findCategoryBySlug,
  findCategoryById,
} from "./categories";

describe("CATEGORIES 対応表", () => {
  it("スラッグが重複していない", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("カテゴリ ID が重複していない", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("スラッグは URL に安全な形式（英小文字・数字・ハイフン）である", () => {
    for (const c of CATEGORIES) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("findCategoryBySlug / findCategoryById", () => {
  it("スラッグからカテゴリを引ける", () => {
    expect(findCategoryBySlug("programming")).toMatchObject({
      id: "b703z-gs1uw",
      name: "プログラミング",
    });
  });

  it("ID からカテゴリを引ける", () => {
    expect(findCategoryById("89b7505ad7")).toMatchObject({
      slug: "career",
      name: "キャリア",
    });
  });

  it("未知のスラッグ・ID は undefined", () => {
    expect(findCategoryBySlug("no-such-slug")).toBeUndefined();
    expect(findCategoryById("no-such-id")).toBeUndefined();
  });
});
