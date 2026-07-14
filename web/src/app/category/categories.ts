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
};

export const CATEGORIES: Category[] = [
  { slug: "programming", id: "b703z-gs1uw", name: "プログラミング" },
  { slug: "career", id: "89b7505ad7", name: "キャリア" },
  { slug: "marketing", id: "h9561nc0p7kh", name: "マーケティング" },
  { slug: "column", id: "column", name: "コラム" },
];

export function findCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function findCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}
