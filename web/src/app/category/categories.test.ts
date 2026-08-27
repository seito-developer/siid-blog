import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  TOPIC_CATEGORIES,
  INTERVIEW_CATEGORY_SLUG,
  findCategoryBySlug,
  findCategoryById,
  displayCategoryName,
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

describe("TOPIC_CATEGORIES", () => {
  it("TOP「カテゴリから探す」用の4カテゴリだけを含む", () => {
    expect(TOPIC_CATEGORIES).toHaveLength(4);
  });

  it("受講生様実績（専用セクションを持つ）は含まない", () => {
    const slugs = TOPIC_CATEGORIES.map((c) => c.slug);
    expect(slugs).not.toContain(INTERVIEW_CATEGORY_SLUG);
  });

  it("CATEGORIES の部分集合である", () => {
    for (const c of TOPIC_CATEGORIES) {
      expect(CATEGORIES).toContain(c);
    }
  });
});

describe("受講生様実績カテゴリ", () => {
  it("スラッグから引ける（表示名は microCMS 名と異なり「受講生様実績」）", () => {
    expect(findCategoryBySlug(INTERVIEW_CATEGORY_SLUG)).toMatchObject({
      id: "interview",
      name: "受講生様実績",
    });
  });

  it("microCMS のカテゴリ ID から引ける", () => {
    expect(findCategoryById("interview")).toMatchObject({
      slug: "interview",
      name: "受講生様実績",
    });
  });
});

describe("displayCategoryName", () => {
  it("対応表の表示名を優先する（microCMS 名と異なる受講生様実績）", () => {
    expect(
      displayCategoryName({ id: "interview", name: "受講生様インタビュー" })
    ).toBe("受講生様実績");
  });

  it("対応表と microCMS の名称が同じカテゴリはそのまま返る", () => {
    expect(
      displayCategoryName({ id: "b703z-gs1uw", name: "プログラミング" })
    ).toBe("プログラミング");
  });

  it("対応表に無いカテゴリは microCMS の名称にフォールバックする", () => {
    expect(displayCategoryName({ id: "no-such-id", name: "旧カテゴリ" })).toBe(
      "旧カテゴリ"
    );
  });
});
