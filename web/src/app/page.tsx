import { client } from '../libs/microcms';
import { BLOG_API_ENDPOINT } from './constants';
import ArticleList from '@/components/article-list';
import { ArticleProps } from '@/interfaces/common';

// microCMSからブログ記事を取得
async function getBlogPosts(): Promise<ArticleProps[]> {
  const data = await client.get({
    endpoint: BLOG_API_ENDPOINT, // 'blog'はmicroCMSのエンドポイント名
    queries: {
      // fields: 'id,title',  // idとtitleを取得
      limit: 10,  // 最新の5件を取得
    },
  });
  return data.contents;
}

export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <main>
      <h1>ブログ記事一覧</h1>
      <ArticleList articles={posts} />
    </main>
  );
}