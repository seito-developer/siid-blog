import { describe, expect, it } from "vitest";
import { HERO_SLIDES, getEnabledHeroSlides } from "./hero-slides";

describe("hero-slides", () => {
  it("enabled なスライドだけを返す", () => {
    const enabled = getEnabledHeroSlides();
    expect(enabled.every((s) => s.enabled)).toBe(true);
    expect(enabled.length).toBe(HERO_SLIDES.filter((s) => s.enabled).length);
  });

  it("スライド id が一意である", () => {
    const ids = HERO_SLIDES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("各スライドに遷移先とラベルが設定されている", () => {
    for (const slide of HERO_SLIDES) {
      expect(slide.baseUrl).toMatch(/^https?:\/\//);
      expect(slide.ctaLabel.length).toBeGreaterThan(0);
      expect(slide.ctaType.length).toBeGreaterThan(0);
    }
  });

  it("キャンペーンスライドは既定で非表示", () => {
    const campaign = HERO_SLIDES.find((s) => s.id === "campaign");
    expect(campaign?.enabled).toBe(false);
  });
});
