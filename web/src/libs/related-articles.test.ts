import { describe, expect, it, vi } from "vitest";

// microCMS クライアントは環境変数が無いと初期化で落ちるため、純関数のテストでは差し替える
vi.mock("@/libs/microcms", () => ({ client: {} }));

import { rankRelatedArticles, titleTokens } from "./related-articles";

const prog = { id: "prog", name: "プログラミング" };
const career = { id: "career", name: "キャリア" };

const article = (
  id: string,
  title: string,
  publishedAt: string,
  category = prog
) => ({ id, title, publishedAt, categories: [category] });

const articles = [
  article("pandas-drop", "pandasで列を削除する方法｜dropの使い方", "2024-01-01"),
  article("pandas-iloc", "pandasのilocとlocの違いを解説", "2024-02-01"),
  article("seaborn", "seabornで箱ひげ図（boxplot）を描く", "2024-03-01"),
  article("python-round", "Pythonで四捨五入する方法", "2024-04-01"),
  article("career-new", "未経験からエンジニア転職する方法", "2026-10-01", career),
  article("prog-new", "AI時代のプログラミング学習", "2026-10-20"),
];

// 渡す CategoryProps の必須項目は判定に使わないため、テストでは id と name だけで足りる
type Candidate = Parameters<typeof rankRelatedArticles>[2][number];
const candidates = articles as unknown as Candidate[];

describe("titleTokens", () => {
  it("英単語は小文字化して重く、日本語は bigram にする", () => {
    const tokens = titleTokens("Pandasの列削除");
    expect(tokens.get("w:pandas")).toBe(3);
    expect(tokens.has("j:列削")).toBe(true);
    expect(tokens.has("j:の列")).toBe(true);
  });
});

describe("rankRelatedArticles", () => {
  it("タイトルが似ている記事を新着より優先する", () => {
    const ids = rankRelatedArticles("pandas-drop", "prog", candidates).map(
      (a) => a.id
    );
    expect(ids[0]).toBe("pandas-iloc");
    expect(ids).toHaveLength(3);
  });

  it("自分自身は含めない", () => {
    const ids = rankRelatedArticles("pandas-drop", "prog", candidates).map(
      (a) => a.id
    );
    expect(ids).not.toContain("pandas-drop");
  });

  it("似ている記事が無ければ同カテゴリの新着で補う", () => {
    const ids = rankRelatedArticles("career-new", "career", candidates).map(
      (a) => a.id
    );
    // キャリアの他記事は無いので、全体の新着で補う
    expect(ids).toHaveLength(3);
    expect(ids[0]).toBe("prog-new");
  });

  it("一覧に自分が無い（新規公開直後など）ときも同カテゴリの新着を返す", () => {
    const ids = rankRelatedArticles("unknown", "prog", candidates).map(
      (a) => a.id
    );
    expect(ids).toEqual(["prog-new", "python-round", "seaborn"]);
  });
});
