import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps, AuthorProps } from "@/interfaces/common";

// 著者ページ（/authors/[id]）用のデータ取得（Issue #70）。
// 著者は blog 記事のフィールド（コンテンツ参照）で、参照フィールドの
// filters[equals] が使えないため、全記事を取得して JS 側でグルーピングする。
// sitemap.ts と同様に getAllContents を用いる。

type PostWithAuthor = ArticleProps & { author: AuthorProps | null };

// 著者ページのカードに必要なフィールド + author 本体
const FIELDS =
  "id,title,eyecatch,thumbnailPreset,categories,category,publishedAt,author";

async function getAllPostsWithAuthor(): Promise<PostWithAuthor[]> {
  return client.getAllContents<PostWithAuthor>({
    endpoint: BLOG_API_ENDPOINT,
    queries: { fields: FIELDS, orders: "-publishedAt" },
  });
}

// 記事に紐づく著者の id 一覧（重複排除）。generateStaticParams 用。
// 著者未設定（defaultAuthor フォールバック）は id を持たないため対象外。
export async function getAuthorIds(): Promise<string[]> {
  const posts = await getAllPostsWithAuthor();
  const ids = new Set<string>();
  for (const post of posts) {
    if (post.author?.id) ids.add(post.author.id);
  }
  return [...ids];
}

export type AuthorPageData = {
  author: AuthorProps;
  articles: ArticleProps[];
};

// 指定 id の著者プロフィールと、その著者名義の記事一覧（新しい順）。
// 該当記事が無ければ null（呼び出し側で notFound）。
export async function getAuthorPageData(
  id: string
): Promise<AuthorPageData | null> {
  const posts = await getAllPostsWithAuthor();
  const articles = posts.filter((post) => post.author?.id === id);
  if (articles.length === 0) {
    return null;
  }
  // プロフィールはいずれの記事の author も同一内容なので先頭を採用
  return { author: articles[0].author!, articles };
}
