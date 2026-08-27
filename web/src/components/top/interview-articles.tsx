import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { INTERVIEW_CATEGORY_SLUG } from "@/app/category/categories";
import { ArticleProps } from "@/interfaces/common";
import ArticleList from "@/components/article-list";
import MoreButton from "@/components/top/more-button";

// 受講生様実績セクション。TOP の新着記事の直下に置く。
// 該当カテゴリの最新3件を新着記事と同じ3カラムで表示し、一覧ページへ誘導する。
// 取得失敗・0件時はセクション非表示（return null）。
// 静的ダミーデータ版の interviews.tsx を置き換えたもの。

const INTERVIEW_ARTICLES_LIMIT = 3;
const INTERVIEW_CATEGORY_HREF = `/category/${INTERVIEW_CATEGORY_SLUG}`;

async function getInterviewArticles(): Promise<ArticleProps[]> {
  try {
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: {
        limit: INTERVIEW_ARTICLES_LIMIT,
        orders: "-publishedAt",
        // 現行スキーマの複数参照フィールドで絞り込む。
        // microCMS で単一参照フィールド category へ移行した際は
        // `category[equals]` に変更すること（Issue #12・category/[slug] と同様）
        filters: `categories[contains]${INTERVIEW_CATEGORY_SLUG}`,
      },
    });
    return data.contents as ArticleProps[];
  } catch {
    return [];
  }
}

export default async function InterviewArticles() {
  const articles = await getInterviewArticles();
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="interview-heading" className="py-4">
      <h2
        id="interview-heading"
        className="mb-6 text-2xl font-bold text-[#214a4a]"
      >
        受講生様実績
      </h2>
      {/* 新着記事と同じ3カラムグリッド。セクション h2 配下なのでカード見出しは h3 */}
      <ArticleList articles={articles} headingLevel="h3" />
      {/* 導線はカード下のボタンに一本化（Issue #94） */}
      <MoreButton
        href={INTERVIEW_CATEGORY_HREF}
        ariaLabel="受講生様実績をもっと見る"
      />
    </section>
  );
}
