import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT, SITE_URL } from "@/app/constants";
import BlogHeader from "@/components/blog-header";
import JsonLd from "@/components/json-ld";

import ArticleBody from "@/components/article-body/article-body";
import Breadcrumbs from "@/components/breadcrumbs";
import BannerSiid from "@/components/banner-siid";
import { getBlogPost } from "./getBlogPost";
import { defaultAuthor } from "./defaultAuthor";
import { findCategoryById } from "@/app/category/categories";
import { getArticleCategory } from "@/libs/article-category";
import { draftMode, cookies } from "next/headers";
import { DRAFT_KEY_COOKIE } from "@/app/api/preview/constants";

type Props = { params: Promise<{ slug: string }> };

// Draft Mode（microCMS プレビュー）中は Cookie の draftKey を返す。
// 通常時は undefined（静的生成では draftMode が無効のため cookies() には触れない）
async function getDraftKey(): Promise<string | undefined> {
  const { isEnabled } = await draftMode();
  if (!isEnabled) {
    return undefined;
  }
  const cookieStore = await cookies();
  return cookieStore.get(DRAFT_KEY_COOKIE)?.value;
}

// 記事詳細ページの生成
export default async function BlogPostPage({
  params,
}: Props) {
  const { slug } = await params; // IDを取得
  const draftKey = await getDraftKey();
  const post = await getBlogPost(slug, draftKey);
  // 1記事1カテゴリ（Issue #12）。スラッグ対応表に無いカテゴリはリンクを出さない
  const postCategory = getArticleCategory(post);
  const category = postCategory && findCategoryById(postCategory.id);
  const categoryBreadcrumbs = [
    ...(category
      ? [{ label: category.name, href: `/category/${category.slug}` }]
      : []),
    { label: post.title, isCurrentPage: true },
  ]
  
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [post.eyecatch.url],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: (post.author || defaultAuthor).name,
    },
    publisher: { "@type": "Organization", name: "SiiD" },
    mainEntityOfPage: articleUrl,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `${SITE_URL}/category/${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 3 : 2,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      {draftKey && (
        <div className="sticky top-0 z-50 bg-[#EE7D2B] text-white text-sm text-center py-2 px-4">
          下書きプレビュー表示中（この内容は公開されていません）
          <a
            href={`/api/exit-preview?redirect=${encodeURIComponent(`/blog/${slug}`)}`}
            className="underline ml-3"
          >
            プレビューを終了
          </a>
        </div>
      )}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs items={categoryBreadcrumbs} />
      <BlogHeader
        eyecatchImage={post.eyecatch.url}
        author={post.author || defaultAuthor}
        category={postCategory?.name || ""}
        date={post.publishedAt}
        title={post.title}
      />
      {/* 記事本文を表示 */}
      <ArticleBody author={post.author || null}>
        {post.contents || "" }
      </ArticleBody>
      <BannerSiid />
    </main>
  );
}

// 静的パスを生成
export async function generateStaticParams() {
  const contentIds = await client.getAllContentIds({
    endpoint: BLOG_API_ENDPOINT,
  });
  return contentIds.map((contentId) => ({
    slug: contentId, // 各記事のIDをパラメータとして返す
  }));
}

// HTMLタグを除去してテキストのみを取得（サーバーサイドのみ）
async function stripHtmlTags(html: string): Promise<string> {
  // サーバーサイドでのみJSDOMを使用
  if (typeof window === 'undefined') {
    try {
      const { JSDOM } = await import('jsdom');
      const dom = new JSDOM(html);
      return dom.window.document.body.textContent || "";
    } catch {
      // JSDOMが利用できない場合は正規表現で代替
      return html.replace(/<[^>]*>/g, '').trim();
    }
  }
  
  // クライアントサイドでは単純な正規表現で代替
  return html.replace(/<[^>]*>/g, '').trim();
}

// メタデータの生成
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  // プレビュー中は下書きでメタデータを生成する（新規未公開記事の 404 回避）
  const post = await getBlogPost(slug, await getDraftKey());

  const plainTextContent = await stripHtmlTags(post.contents);
  const description = plainTextContent.slice(0, 120) + "...";

  return {
    title: post.title,
    description: description,           // 120 文字要約
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: description,
      url: `${SITE_URL}/blog/${slug}`,
      images: [{ url: post.eyecatch.url }],
      publishedTime: post.publishedAt,
      author: [post.author?.name || "AI講師 シンディ"],
    },
  };
}