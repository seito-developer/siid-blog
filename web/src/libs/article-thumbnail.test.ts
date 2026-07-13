import { describe, expect, it } from "vitest";
import { getArticleThumbnail, THUMBNAIL_GENRES } from "./article-thumbnail";

const eyecatch = {
  url: "https://images.microcms-assets.io/assets/x/y/photo.png",
  width: 800,
  height: 450,
};

describe("getArticleThumbnail", () => {
  it("eyecatch があればそれを最優先で返す", () => {
    expect(
      getArticleThumbnail({ id: "a", eyecatch, thumbnailPreset: ["テック"] })
    ).toEqual(eyecatch);
  });

  it("ジャンル選択に対応する画像を返す（セレクトは配列で来る）", () => {
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: ["テック"] })
    ).toMatchObject({ url: "/thumbnails/tech.png", width: 1200, height: 630 });
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: ["キャリア"] }).url
    ).toBe("/thumbnails/career.png");
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: ["学習"] }).url
    ).toBe("/thumbnails/learning.png");
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: ["Tips"] }).url
    ).toBe("/thumbnails/tips.png");
  });

  it("文字列単体でも受け付ける", () => {
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: "キャリア" }).url
    ).toBe("/thumbnails/career.png");
  });

  it("旧選択肢（preset-01〜04）も後方互換で対応する画像に解決する", () => {
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: ["preset-01"] }).url
    ).toBe("/thumbnails/tech.png");
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: ["preset-04"] }).url
    ).toBe("/thumbnails/tips.png");
  });

  it("未知の値・未設定は記事 ID から決まる既定画像にフォールバック", () => {
    const fallback = getArticleThumbnail({ id: "abc123" });
    expect(fallback.url).toMatch(
      /^\/thumbnails\/(tech|career|learning|tips)\.png$/
    );
    // 同じ記事 ID なら常に同じ画像
    expect(getArticleThumbnail({ id: "abc123" }).url).toBe(fallback.url);
    expect(
      getArticleThumbnail({ id: "abc123", thumbnailPreset: ["nope"] }).url
    ).toBe(fallback.url);
  });

  it("ジャンル定義が4種ある", () => {
    expect(THUMBNAIL_GENRES).toHaveLength(4);
  });
});
