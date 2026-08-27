// カテゴリ URL スラッグ ↔ microCMS カテゴリの対応表。
// スラッグは URL（/category/<slug>）に使うためコード側で管理する。
// microCMS 側でカテゴリを追加・変更した場合はここにも追記すること。
// ※「Programming」(英語) は「プログラミング」に統合済み（Issue #42。
//   付け替えは scripts/merge-programming-category.mjs で実施）。
// ※ 旧カテゴリ（JavaScript 等の技術別・転職・Uncategorized）は
//   プログラミング/キャリア/コラム に統合済み（Issue #51。
//   付け替えは scripts/migrate-categories-issue51.mjs で実施）。

export type Category = {
  slug: string; // URL 用スラッグ（英小文字・ハイフン）
  id: string; // microCMS のカテゴリコンテンツ ID
  name: string; // 表示名
  // TOP「カテゴリから探す」グリッドに並べるトピック系カテゴリかどうか（既定 true）。
  // 受講生様実績は専用セクションを持つため false にして重複を避ける。
  isTopic?: boolean;
};

export const CATEGORIES: Category[] = [
  { slug: "programming", id: "b703z-gs1uw", name: "プログラミング" },
  { slug: "career", id: "89b7505ad7", name: "キャリア" },
  { slug: "marketing", id: "h9561nc0p7kh", name: "マーケティング" },
  { slug: "column", id: "column", name: "コラム" },
  // 表示名は microCMS 側のカテゴリ名「受講生様インタビュー」とは意図的に異なる。
  // サイト内の導線・見出しはすべて「受講生様実績」で統一する（オーナー決定）。
  { slug: "interview", id: "interview", name: "受講生様実績", isTopic: false },
];

// 受講生様実績カテゴリのスラッグ。TOP セクション等の導線から参照する
export const INTERVIEW_CATEGORY_SLUG = "interview";

// TOP「カテゴリから探す」に並べるカテゴリ（記事トピック系のみ）
export const TOPIC_CATEGORIES = CATEGORIES.filter((c) => c.isTopic !== false);

export function findCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function findCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

// 記事に紐づくカテゴリの「サイト内表示名」を返す。
// 対応表の name を優先し、未登録カテゴリは microCMS の名称をそのまま使う。
// 受講生様実績のように microCMS 側の名称（受講生様インタビュー）と
// サイト表示名が意図的に異なるケースを一箇所に集約するためのヘルパー。
export function displayCategoryName(category: {
  id: string;
  name: string;
}): string {
  return findCategoryById(category.id)?.name ?? category.name;
}
