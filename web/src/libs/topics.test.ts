import { describe, expect, it } from "vitest";
import { TOPICS, filterTopicArticles, findTopicBySlug } from "./topics";

const article = (title: string, publishedAt: string) => ({ title, publishedAt });

describe("findTopicBySlug", () => {
  it("スラッグからテーマを引ける", () => {
    expect(findTopicBySlug("pandas")?.name).toBe("pandas");
  });

  it("未知のスラッグは undefined", () => {
    expect(findTopicBySlug("unknown")).toBeUndefined();
  });

  it("スラッグは重複しない", () => {
    const slugs = TOPICS.map((topic) => topic.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("filterTopicArticles", () => {
  const articles = [
    article("Pandasでデータをソートする方法", "2024-01-01T00:00:00.000Z"),
    article("【完全解説】pandasで行・列を削除する様々な方法", "2024-03-01T00:00:00.000Z"),
    article("Seabornを用いた散布図の作り方", "2024-02-01T00:00:00.000Z"),
    article("エンジニア転職のポイント", "2024-04-01T00:00:00.000Z"),
  ];

  it("タイトルのキーワード（大文字小文字を区別しない）で集め、新しい順に並べる", () => {
    const result = filterTopicArticles(findTopicBySlug("pandas")!, articles);
    expect(result.map((a) => a.title)).toEqual([
      "【完全解説】pandasで行・列を削除する様々な方法",
      "Pandasでデータをソートする方法",
    ]);
  });

  it("matplotlib・Seaborn は両方のキーワードを集める", () => {
    const result = filterTopicArticles(findTopicBySlug("matplotlib-seaborn")!, [
      ...articles,
      article("matplotlibで日本語が文字化け", "2024-05-01T00:00:00.000Z"),
    ]);
    expect(result).toHaveLength(2);
  });
});
