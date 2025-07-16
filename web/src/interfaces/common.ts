export interface TagProps {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

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

export interface ArticleProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  categories: CategoryProps[];
  tags: TagProps[];
  eyecatch: EyecatchProps;
  slug: string;
}
