import dayjs from 'dayjs';
import { client } from '@/libs/microcms';
import { BLOG_API_ENDPOINT } from '@/app/constants';
import BlogHeader from '@/components/blog-header';

// ブログ記事の型定義
type Props = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  contents: string;
  eyecatch: {
    url: string;
    height: number;
    width: number;
  }
  author: string;
  category: string;
  tags: string[];
};

// microCMSから特定の記事を取得
async function getBlogPost(id: string): Promise<Props> {
  const data = await client.get({
    endpoint: `${BLOG_API_ENDPOINT}/${id}`,
  });
  return data;
}

// 記事詳細ページの生成
export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // IDを取得
  const post = await getBlogPost(id);
console.log('post:', post);
  // dayjsを使ってpublishedAtをYY.MM.DD形式に変換
  const formattedDate = dayjs(post.publishedAt).format('YY.MM.DD');

  return (
    // <main>
    //   <h1>{post.title}</h1> {/* タイトルを表示 */}
    //   <div>{formattedDate}</div> {/* 日付を表示 */}
    //   <div>カテゴリー：{post.category && post.category.name}</div> {/* カテゴリーを表示 */}
    //   <div dangerouslySetInnerHTML={{ __html: post.contents || "" }} /> {/* 記事本文を表示 */}
    // </main>
    <div className="min-h-screen bg-[#F4F4F4]">
          <BlogHeader
            eyecatch={post.eyecatch ?? {}}
            authorName={post.author || ""}
            // authorImage={post.author はいName || ""}
            tags={post.tags}
            category={post.category}
            date={post.publishedAt}
            title={post.title}
          />
      </div>
  );
}

// 静的パスを生成
export async function generateStaticParams() {
  const contentIds = await client.getAllContentIds({ endpoint: BLOG_API_ENDPOINT });
  return contentIds.map((contentId) => ({
    id: contentId, // 各記事のIDをパラメータとして返す
  }));
}