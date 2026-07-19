import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT, SITE_NAME, SITE_URL } from "@/app/constants";
import { X_URL, YOUTUBE_SEITO_URL } from "@/app/links";
import BlogHeader from "@/components/blog-header";
import JsonLd from "@/components/json-ld";

import ArticleBody from "@/components/article-body/article-body";
import ArticleToc from "@/components/article-body/article-toc";
import Breadcrumbs from "@/components/breadcrumbs";
import ArticleCtaCard from "@/components/article-cta-card";
import AuthorCard from "@/components/author-card";
import RelatedArticles from "@/components/related-articles";
import ShareButtons from "@/components/share-buttons";
import CvWidget from "@/components/cv-widget";
import SidebarYouTube from "@/components/sidebar-youtube";
import SpStickyCta from "@/components/sp-sticky-cta";
import { buildArticleContent, inlineCtaSegmentIndex } from "@/libs/article-content";
import { getRelatedArticles } from "@/libs/related-articles";
import { isAiAuthor, isSeitoAuthor } from "@/libs/author";
import { getBlogPost } from "./getBlogPost";
import { defaultAuthor } from "./defaultAuthor";
import { findCategoryById } from "@/app/category/categories";
import { getArticleCategory } from "@/libs/article-category";
import { getArticleThumbnail } from "@/libs/article-thumbnail";
import { buildArticleDescription } from "@/libs/article-description";
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

  // 本文の後処理（サニタイズ → 見出し id 付与 → h2 区切り分割）と本文途中 CTA の挿入位置
  const articleContent = await buildArticleContent(post.contents || "");
  const inlineCtaIndex = inlineCtaSegmentIndex(articleContent.segments.length);
  // 関連記事は1回だけ取得し、SP（本文末）と PC（サイドバー）で使い回す（Issue #56 / #66）
  const relatedArticles = await getRelatedArticles(postCategory?.id, slug);
  const categoryBreadcrumbs = [
    ...(category
      ? [{ label: category.name, href: `/category/${category.slug}` }]
      : []),
    { label: post.title, isCurrentPage: true },
  ]
  
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  // eyecatch 未設定時はプリセットにフォールバック（相対パスは絶対 URL 化）
  const thumbnail = getArticleThumbnail(post);
  const thumbnailAbsoluteUrl = thumbnail.url.startsWith("/")
    ? `${SITE_URL}${thumbnail.url}`
    : thumbnail.url;
  // AI 著者シンディの記事は author を Person にせず Organization(SiiD) とし、
  // 実在人物と誤認される構造を避ける（Issue #60）。実在著者は Person に
  // description / url / sameAs（セイト先生のみ YouTube・X）を付与する（Issue #58）
  const articleAuthorJsonLd = isAiAuthor(post.author)
    ? { "@id": `${SITE_URL}/#organization` }
    : {
        "@type": "Person",
        name: post.author!.name,
        ...(post.author!.description
          ? { description: post.author!.description }
          : {}),
        ...(isSeitoAuthor(post.author)
          ? { url: YOUTUBE_SEITO_URL, sameAs: [YOUTUBE_SEITO_URL, X_URL] }
          : {}),
      };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [thumbnailAbsoluteUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: articleAuthorJsonLd,
    // Organization 本体は layout.tsx で全ページに出力している（Issue #59）
    publisher: { "@id": `${SITE_URL}/#organization` },
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
        eyecatchImage={thumbnail.url}
        author={post.author || defaultAuthor}
        category={postCategory?.name || ""}
        categoryHref={category ? `/category/${category.slug}` : undefined}
        date={post.publishedAt}
        title={post.title}
      />

      {/* PC は2カラム（本文 + サイドバー320px）、lg 未満は1カラム（Issue #66） */}
      <div className="mx-auto max-w-6xl py-8 lg:px-6 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
          {/* 本文カラム */}
          <div className="min-w-0">
            {/* SP: 本文冒頭に目次（折りたたみ）。PC はサイドバー側で表示（Issue #67） */}
            <div className="mb-8 px-6 lg:hidden">
              <ArticleToc headings={articleContent.headings} variant="mobile" />
            </div>

            <ArticleBody
              author={post.author || null}
              segments={articleContent.segments}
              slug={slug}
              inlineCtaIndex={inlineCtaIndex}
            />

            {/* 本文末: シェアボタン → 著者カード → 統合CTA（Issue #68/#58/#57） */}
            <ShareButtons url={articleUrl} title={post.title} />
            <AuthorCard author={post.author || defaultAuthor} />
            <ArticleCtaCard slug={slug} />

            {/* SP: 関連記事 → YouTube を本文末に縦積み（PC はサイドバー側で表示） */}
            <div className="px-6 lg:hidden">
              <RelatedArticles articles={relatedArticles} variant="grid" />
              <section className="pb-16">
                <SidebarYouTube slug={slug} variant="stacked" />
              </section>
            </div>
          </div>

          {/* PC サイドバー: 目次 → CVウィジェット → YouTube → 関連記事（Issue #66） */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <ArticleToc headings={articleContent.headings} variant="desktop" />
              <CvWidget slug={slug} />
              <SidebarYouTube slug={slug} variant="sidebar" />
              <RelatedArticles articles={relatedArticles} variant="sidebar" />
            </div>
          </aside>
        </div>
      </div>

      {/* SP 限定の下部追従 CTA バー（Issue #69） */}
      <SpStickyCta slug={slug} />
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
  // microCMS の説明文フィールド（excerpt）を優先し、無ければ本文を文末で切り詰める
  const description = buildArticleDescription(post.excerpt, plainTextContent);
  const thumbnailUrl = getArticleThumbnail(post).url;

  return {
    // TOP・カテゴリページとサイト名サフィックスを統一（Issue #59）
    title: `${post.title} | ${SITE_NAME}`,
    description: description,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: description,
      url: `${SITE_URL}/blog/${slug}`,
      // eyecatch 未設定時はプリセット（相対パスは metadataBase で絶対 URL 化される）
      images: [{ url: thumbnailUrl }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      author: [post.author?.name || "AI講師 シンディ"],
    },
    // 指定しないと layout のサイト共通値（SiiD BLOG）が使われ、
    // X 共有時のカードに記事タイトルが表示されない
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: [thumbnailUrl],
    },
  };
}