import { ArticleProps, CategoryProps } from "@/interfaces/common";

// 記事のカテゴリを1つ返す（1記事1カテゴリ方針 / Issue #12）。
// microCMS スキーマ移行の前後どちらでも動くよう、
// 新スキーマの単一参照 `category` を優先し、旧スキーマの
// 複数参照 `categories` は先頭のみを採用する。未設定は undefined。
export function getArticleCategory(
  article: Pick<ArticleProps, "category" | "categories">
): CategoryProps | undefined {
  return article.category ?? article.categories?.[0];
}
