import ArticleManager from '@/components/article-manager';
import { GetStaticPropsContext } from 'next';
import { BLOG_API_ENDPOINT } from '@/app/constants';
import { client } from '@/libs/microcms';
import { ArticleProps } from '@/interfaces/common';

const PER_PAGE = 5; 

// pages/blog/[id].js
export default function BlogPageId({ posts, totalCount } : { posts: ArticleProps[], totalCount: number }) {
  return (
    <div>
      <ArticleManager
        articles={posts}
        totalCount={totalCount}
        />
    </div>
  );
}

// 動的なページを作成
export const getStaticPaths = async () => {
  const repos = await client.get({ endpoint: BLOG_API_ENDPOINT });

  const range = (start: number, end: number) => [...Array(end - start + 1)].map((_, i) => start + i);

  const paths = range(1, Math.ceil(repos.totalCount / PER_PAGE)).map((repo) => `${BLOG_API_ENDPOINT}/page/${repo}`);

  return { paths, fallback: false };
};

// データを取得
export const getStaticProps = async (context: GetStaticPropsContext) => {
  const id = Number(context.params?.id ?? 1); // デフォルトは1ページ目

  const data = await client.get({ endpoint: BLOG_API_ENDPOINT, queries: { offset: (id - 1) * 5, limit: 5 } });

  return {
    props: {
      posts: data.contents,
      totalCount: data.totalCount,
    },
  };
};