import { describe, expect, it } from "vitest";
import { cn, formatDate } from "./utils";

describe("formatDate", () => {
  it("ISO 日時文字列を YYYY/MM/DD 形式（日本語ロケール）に変換する", () => {
    // 正午(UTC)を使い、実行環境のタイムゾーンによらず同じ日付になるようにする
    expect(formatDate("2026-01-05T12:00:00.000Z")).toBe("2026/01/05");
  });
});

describe("cn", () => {
  it("クラス名を結合し、重複する Tailwind クラスは後勝ちでマージする", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe(
      "text-sm font-bold"
    );
  });
});
