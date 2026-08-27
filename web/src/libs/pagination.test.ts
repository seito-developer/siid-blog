import { describe, expect, it } from "vitest";
import { normalizePage, normalizePerPage, pageToOffset } from "./pagination";

describe("normalizePage", () => {
  it("正の整数はそのまま返す", () => {
    expect(normalizePage("1")).toBe(1);
    expect(normalizePage("12")).toBe(12);
  });

  it("未指定は 1", () => {
    expect(normalizePage(undefined)).toBe(1);
  });

  it("0・負数・数値以外は 1 に丸める", () => {
    expect(normalizePage("0")).toBe(1);
    expect(normalizePage("-3")).toBe(1);
    expect(normalizePage("abc")).toBe(1);
    expect(normalizePage("")).toBe(1);
  });
});

describe("normalizePerPage", () => {
  it("正の整数はそのまま返す", () => {
    expect(normalizePerPage("20", 10)).toBe(20);
  });

  it("未指定・不正値は既定値にフォールバックする", () => {
    expect(normalizePerPage(undefined, 10)).toBe(10);
    expect(normalizePerPage("0", 10)).toBe(10);
    expect(normalizePerPage("-5", 10)).toBe(10);
    expect(normalizePerPage("abc", 10)).toBe(10);
  });
});

describe("pageToOffset", () => {
  it("1ページ目は offset 0", () => {
    expect(pageToOffset(1, 10)).toBe(0);
  });

  it("2ページ目以降は (page - 1) * limit", () => {
    expect(pageToOffset(2, 10)).toBe(10);
    expect(pageToOffset(5, 6)).toBe(24);
  });
});
