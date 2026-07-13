import { describe, expect, it } from "vitest";
import {
  getArticleThumbnail,
  THUMBNAIL_PRESETS,
} from "./article-thumbnail";

const eyecatch = {
  url: "https://images.microcms-assets.io/assets/x/y/photo.png",
  width: 800,
  height: 450,
};

describe("getArticleThumbnail", () => {
  it("eyecatch があればそれを最優先で返す", () => {
    expect(
      getArticleThumbnail({ id: "a", eyecatch, thumbnailPreset: ["preset-02"] })
    ).toEqual(eyecatch);
  });

  it("eyecatch が無ければ選択されたプリセットを返す（セレクトは配列で来る）", () => {
    const result = getArticleThumbnail({
      id: "a",
      thumbnailPreset: ["preset-02"],
    });
    expect(result.url).toBe("/thumbnails/preset-02.png");
    expect(result).toMatchObject({ width: 1200, height: 630 });
  });

  it("プリセットが文字列単体でも受け付ける", () => {
    expect(
      getArticleThumbnail({ id: "a", thumbnailPreset: "preset-03" }).url
    ).toBe("/thumbnails/preset-03.png");
  });

  it("未知のプリセット値・未設定は記事 ID から決まる既定プリセットにフォールバック", () => {
    const fallback = getArticleThumbnail({ id: "abc123" });
    expect(fallback.url).toMatch(/^\/thumbnails\/preset-0[1-4]\.png$/);
    // 同じ記事 ID なら常に同じ画像
    expect(getArticleThumbnail({ id: "abc123" }).url).toBe(fallback.url);
    // 未知の値も同様にフォールバック
    expect(
      getArticleThumbnail({ id: "abc123", thumbnailPreset: ["nope"] }).url
    ).toBe(fallback.url);
  });

  it("プリセット定義が4種ある", () => {
    expect(THUMBNAIL_PRESETS).toHaveLength(4);
  });
});
