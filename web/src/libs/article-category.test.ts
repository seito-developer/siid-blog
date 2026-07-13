import { describe, expect, it } from "vitest";
import { getArticleCategory } from "./article-category";
import { CategoryProps } from "@/interfaces/common";

const cat = (id: string, name: string): CategoryProps => ({
  id,
  name,
  createdAt: "",
  updatedAt: "",
  publishedAt: "",
  revisedAt: "",
});

describe("getArticleCategory", () => {
  it("新スキーマの単一参照 category を最優先で返す", () => {
    expect(
      getArticleCategory({
        category: cat("new", "新"),
        categories: [cat("old", "旧")],
      })?.id
    ).toBe("new");
  });

  it("旧スキーマの categories は先頭のみを採用する", () => {
    expect(
      getArticleCategory({
        categories: [cat("first", "1つ目"), cat("second", "2つ目")],
      })?.id
    ).toBe("first");
  });

  it("カテゴリ未設定（両方無し・空配列）は undefined", () => {
    expect(getArticleCategory({})).toBeUndefined();
    expect(getArticleCategory({ categories: [] })).toBeUndefined();
  });
});
