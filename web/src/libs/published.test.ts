import { describe, expect, it } from "vitest";
import { filterPublished, isPublished } from "./published";

describe("isPublished", () => {
  it("publishedAt があれば公開済み", () => {
    expect(isPublished({ publishedAt: "2026-09-01T00:00:00.000Z" })).toBe(true);
  });

  it("publishedAt が無い下書きは未公開", () => {
    expect(isPublished({})).toBe(false);
    expect(isPublished({ publishedAt: undefined })).toBe(false);
    expect(isPublished({ publishedAt: null })).toBe(false);
    expect(isPublished({ publishedAt: "" })).toBe(false);
  });
});

describe("filterPublished", () => {
  it("下書きを除外し、公開済みの順序を保つ", () => {
    const items = [
      { id: "a", publishedAt: "2026-09-01T00:00:00.000Z" },
      { id: "draft", publishedAt: null },
      { id: "b", publishedAt: "2026-09-02T00:00:00.000Z" },
      { id: "never" },
    ];
    expect(filterPublished(items).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("空配列はそのまま", () => {
    expect(filterPublished([])).toEqual([]);
  });
});
