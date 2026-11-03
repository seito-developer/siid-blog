import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DEFAULT_OGP_IMAGE, SITE_NAME, SITE_URL } from "@/app/constants";
import ArticleList from "@/components/article-list";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import TopicNav from "@/components/topic-nav";
import { getArticleIndex } from "@/libs/article-index";
import { TOPICS, filterTopicArticles, findTopicBySlug } from "@/libs/topics";

type Props = { params: Promise<{ slug: string }> };

// 記事の追加・更新は Webhook の再デプロイで反映される。念のため1日1回は再生成する
export const revalidate = 86400;
// 定義済みのテーマ以外は 404
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

// テーマ別まとめページ（記事タイトルのキーワードで集めた一覧）
export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = findTopicBySlug(slug);
  if (!topic) {
    notFound();
  }
  const articles = filterTopicArticles(topic, await getArticleIndex());
  if (articles.length === 0) {
    notFound();
  }

  const url = `${SITE_URL}/topics/${topic.slug}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "プログラミング",
        item: `${SITE_URL}/category/programming`,
      },
      { "@type": "ListItem", position: 3, name: `${topic.name}の記事まとめ`, item: url },
    ],
  };

  return (
    <main className="min-h-screen bg-siid-bg">
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs
        items={[
          { label: "プログラミング", href: "/category/programming" },
          { label: `${topic.name}の記事まとめ`, isCurrentPage: true },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-siid-text">
            {topic.name}の記事まとめ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {topic.description}
          </p>
          <p className="mt-2 text-gray-600">記事数: {articles.length}件</p>
        </div>
        <ArticleList articles={articles} />
        <div className="mt-16">
          <TopicNav currentSlug={topic.slug} heading="ほかのテーマの記事まとめ" />
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = findTopicBySlug(slug);
  if (!topic) {
    return {};
  }
  const title = `${topic.name}の記事まとめ | ${SITE_NAME}`;
  const url = `${SITE_URL}/topics/${topic.slug}`;
  return {
    title,
    description: topic.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: topic.description,
      type: "website",
      url,
      images: [{ url: DEFAULT_OGP_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: topic.description,
      images: [DEFAULT_OGP_IMAGE],
    },
  };
}
