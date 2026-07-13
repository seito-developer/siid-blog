import { describe, expect, it } from "vitest";
import { cn, formatDate } from "./utils";

describe("formatDate", () => {
  it("ISO 日時文字列を YYYY/MM/DD 形式（日本語ロケール）に変換する", () => {
    expect(formatDate("2026-01-05T12:00:00.000Z")).toBe("2026/01/05");
  });

  it("実行環境のタイムゾーンによらず JST の日付で整形する", () => {
    // UTC では 12/9 だが JST では 12/10。サーバー（UTC）でも
    // JST の日付になること（SSR とブラウザ表示の1日ずれの回帰テスト）
    expect(formatDate("2025-12-09T20:00:00.000Z")).toBe("2025/12/10");
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
