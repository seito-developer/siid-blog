
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

export interface AuthorProps {
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
  categories: CategoryProps[];
  tags: TagProps[];
  eyecatch: EyecatchProps;
  slug: string;
}

export interface ArticleContentProps extends ArticleProps {
  contents: string;
}