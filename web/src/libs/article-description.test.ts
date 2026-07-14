import { describe, expect, it } from "vitest";
import { buildArticleDescription } from "./article-description";

describe("buildArticleDescription", () => {
  it("excerpt があればそのまま使う", () => {
    expect(buildArticleDescription("記事の説明文です。", "本文テキスト")).toBe(
      "記事の説明文です。"
    );
  });

  it("excerpt が空白のみなら本文フォールバックを使う", () => {
    expect(buildArticleDescription("   ", "短い本文です。")).toBe(
      "短い本文です。"
    );
  });

  it("本文が120文字以下ならそのまま返す", () => {
    const text = "短い本文です。";
    expect(buildArticleDescription(undefined, text)).toBe(text);
  });

  it("長い本文は文末（句点）で切り詰める", () => {
    const sentence = "これはテスト用の文章でありある程度の長さがあります。";
    const text = sentence.repeat(10);
    const result = buildArticleDescription(undefined, text);
    expect(result.length).toBeLessThanOrEqual(120);
    expect(result.endsWith("。")).toBe(true);
    // 文の途中で切れていない（結果は文の繰り返しで構成される）
    expect(text.startsWith(result)).toBe(true);
  });

  it("120文字以内に文末が無い場合は末尾を省略記号にする", () => {
    const text = "あ".repeat(300);
    const result = buildArticleDescription(undefined, text);
    expect(result).toBe("あ".repeat(120) + "…");
  });

  it("連続する空白・改行は1つの空白にまとめる", () => {
    expect(buildArticleDescription(undefined, "一行目\n\n  二行目。")).toBe(
      "一行目 二行目。"
    );
  });
});
