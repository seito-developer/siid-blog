// カテゴリ URL スラッグ ↔ microCMS カテゴリの対応表。
// スラッグは URL（/category/<slug>）に使うためコード側で管理する。
// microCMS 側でカテゴリを追加・変更した場合はここにも追記すること。
// ※「Programming」(英語) は「プログラミング」に統合済み（Issue #42。
//   付け替えは scripts/merge-programming-category.mjs で実施）。

export type Category = {
  slug: string; // URL 用スラッグ（英小文字・ハイフン）
  id: string; // microCMS のカテゴリコンテンツ ID
  name: string; // 表示名
};

export const CATEGORIES: Category[] = [
  { slug: "programming", id: "b703z-gs1uw", name: "プログラミング" },
  { slug: "career", id: "89b7505ad7", name: "キャリア" },
  { slug: "marketing", id: "h9561nc0p7kh", name: "マーケティング" },
  { slug: "job-change", id: "423af599b3", name: "転職" },
  { slug: "javascript", id: "eda71746c0", name: "JavaScript" },
  { slug: "typescript", id: "969545dde1", name: "TypeScript" },
  { slug: "python", id: "11a4a60b51", name: "Python" },
  { slug: "html", id: "e5e239560b", name: "HTML" },
  { slug: "docker", id: "d548c5b83f", name: "Docker" },
  { slug: "aws", id: "7d1507284a", name: "AWS" },
  { slug: "flutter", id: "be13961a0a", name: "Flutter" },
  { slug: "storybook", id: "14d45cd393", name: "Storybook" },
  { slug: "excel", id: "faba1e00af", name: "Excel" },
  { slug: "spreadsheets", id: "c5c75c9a97", name: "Spredsheets" },
  { slug: "vba", id: "dbbae1b99a", name: "VBA" },
  { slug: "gas", id: "2fe840e132", name: "GAS" },
  { slug: "uncategorized", id: "770a5f097c", name: "Uncategorized" },
];

export function findCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function findCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}
