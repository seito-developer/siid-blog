import { describe, expect, it } from "vitest";
import { isAiAuthor, isSeitoAuthor } from "./author";
import { AuthorProps } from "@/interfaces/common";

function author(name: string): AuthorProps {
  return {
    id: "a1",
    name,
    description: "",
    image: null,
    createdAt: "",
    updatedAt: "",
    publishedAt: "",
    revisedAt: "",
  };
}

describe("isAiAuthor", () => {
  it("スペース有無どちらの表記のシンディも AI と判定する", () => {
    expect(isAiAuthor(author("AI講師 シンディ"))).toBe(true);
    expect(isAiAuthor(author("AI講師シンディ"))).toBe(true);
  });

  it("著者未設定（null）は AI（デフォルト著者）扱い", () => {
    expect(isAiAuthor(null)).toBe(true);
  });

  it("実在著者は AI ではない", () => {
    expect(isAiAuthor(author("セイト先生"))).toBe(false);
  });
});

describe("isSeitoAuthor", () => {
  it("セイト先生を判定する", () => {
    expect(isSeitoAuthor(author("セイト先生"))).toBe(true);
    expect(isSeitoAuthor(author("AI講師 シンディ"))).toBe(false);
    expect(isSeitoAuthor(null)).toBe(false);
  });
});
