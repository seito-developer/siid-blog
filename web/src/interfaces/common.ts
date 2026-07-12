
export interface CategoryProps {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

export interface EyecatchProps {
  url: string;
  height: number;
  width: number;
}

export interface AuthorProps {
  id: string;
  createdAt: string;
  description: string;
  image: EyecatchProps | null;
  name: string;
  publishedAt: string;
  revisedAt: string;
  updatedAt: string;
}

export interface ArticleProps {
  id: string;
  title: string;
  excerpt: string;
  author: AuthorProps | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  readTime: string;
  // カテゴリは1記事1つ（Issue #12）。取得は libs/article-category.ts の
  // getArticleCategory() を使うこと（スキーマ移行の前後どちらでも動く）
  category?: CategoryProps; // 新スキーマ: 単一コンテンツ参照
  categories?: CategoryProps[]; // 旧スキーマ: 複数コンテンツ参照（先頭のみ使用）
  eyecatch: EyecatchProps;
  slug: string;
}

export interface ArticleContentProps extends ArticleProps {
  contents: string;
}