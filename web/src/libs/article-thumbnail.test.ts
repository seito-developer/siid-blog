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
      getArticleThumbnail({ id: "a", eyecatch, thumbnailPreset: ["Tech"] })
    ).toEqual(eyecatch);
  });

  it("ジャンル選択に対応する画像を返す（セレクトは配列で来る）", () => {
    const cases: [string, string][] = [
      ["Tech", "tech"],
      ["Learning", "learning"],
      ["Career", "career"],
      ["Frontend", "frontend"],
      ["Backend", "backend"],
      ["AI", "ai"],
    ];
    for (const [genre, file] of cases) {
      expect(
        getArticleThumbnail({ id: "a", thumbnailPreset: [genre] })
      ).toMatchObject({
        url: `/thumbnails/${file}.png`,
        width: 1200,
        height: 630,
      });
    }
  });

  it("文字列単体でも受け付ける", () => {
    expect(getArticleThumbnail({ id: "a", thumbnailPreset: "AI" }).url).toBe(
      "/thumbnails/ai.png"
    );
  });

  it("未知の値・未設定は記事 ID から決まる既定画像にフォールバック", () => {
    const fallback = getArticleThumbnail({ id: "abc123" });
    expect(fallback.url).toMatch(
      /^\/thumbnails\/(tech|learning|career|frontend|backend|ai)\.png$/
    );
    // 同じ記事 ID なら常に同じ画像
    expect(getArticleThumbnail({ id: "abc123" }).url).toBe(fallback.url);
    expect(
      getArticleThumbnail({ id: "abc123", thumbnailPreset: ["nope"] }).url
    ).toBe(fallback.url);
  });

  it("ジャンル定義が6種ある", () => {
    expect(THUMBNAIL_GENRES).toHaveLength(6);
  });
});
