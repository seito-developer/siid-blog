import { client } from '../libs/microcms';
import { BLOG_API_ENDPOINT } from './constants';
import ArticleList from '@/components/article-list';
import { ArticleProps } from '@/interfaces/common';

// microCMSからブログ記事を取得
async function getBlogPosts(): Promise<{posts: ArticleProps[], totalCount: number}> {
  const data = await client.get({
    endpoint: BLOG_API_ENDPOINT, // 'blog'はmicroCMSのエンドポイント名
    queries: {
      offset: 0,
      limit: 10,
    },
  });
  return {
    posts: data.contents,
    totalCount: data.totalCount
  };
}

export default async function Home() {
  const { posts, totalCount } = await getBlogPosts();

  return (
    <main>
      <ArticleList articles={posts} totalCount={totalCount} />
    </main>
  );
}