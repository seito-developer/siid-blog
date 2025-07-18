import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import BlogHeader from "@/components/blog-header";
import { ArticleContentProps } from "@/interfaces/common";
import ArticleBody from "@/components/article-body/article-body";
import Breadcrumbs from "@/components/breadcrumbs";
import BannerSiid from "@/components/bannaer-siid";

// microCMSから特定の記事を取得
async function getBlogPost(slug: string): Promise<ArticleContentProps> {
  try {
    const data = await client.get({
      endpoint: `${BLOG_API_ENDPOINT}/${slug}`,
    });
    return data;
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    throw new Error(`Blog post with id ${slug} not found`);
  }
}


// 記事詳細ページの生成
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // IDを取得
  const post = await getBlogPost(slug);

  const categoryBreadcrumbs = [
    // { label: post.categories[0].name, href: `/${post.categories[0].id}` },
    { label: post.title, isCurrentPage: true },
  ]
  
  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      <Breadcrumbs items={categoryBreadcrumbs} />
      <BlogHeader
        eyecatchImage={post.eyecatch.url}
        author={post.author}
        tags={post.tags || []}
        category={post.categories[0]?.name || ""}
        date={post.publishedAt}
        title={post.title}
      />
      {/* 記事本文を表示 */}
      <ArticleBody>
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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const plainTextContent = await stripHtmlTags(post.contents);
  const description = plainTextContent.slice(0, 120) + "...";

  return {
    title: post.title,
    description: description,           // 120 文字要約
    alternates: {
      canonical: `https://blog.bug-fix.org/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: description,
      url: `https://blog.bug-fix.org/blog/${slug}`,
      images: [{ url: post.eyecatch.url }],
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}