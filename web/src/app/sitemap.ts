import type { MetadataRoute } from "next";
import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT, SITE_URL } from "./constants";
import { findCategoryById } from "./category/categories";

// 1日1回再生成する（記事の追加・更新はこの周期で sitemap に反映される）
export const revalidate = 86400;

type SitemapArticle = {
  id: string;
  revisedAt?: string;
  category?: { id: string }; // 新スキーマ: 単一参照
  categories?: { id: string }[]; // 旧スキーマ: 複数参照
  author?: { id: string } | null; // 著者ページ（/authors/[id]）列挙用（Issue #70）
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await client.getAllContents<SitemapArticle>({
    endpoint: BLOG_API_ENDPOINT,
    queries: { fields: "id,revisedAt,categories,category,author" },
  });

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/blog/${article.id}`,
    lastModified: article.revisedAt,
  }));

  // 記事が1件以上あり、スラッグ対応表に載っているカテゴリのみを列挙する
  // （1記事1カテゴリ方針。単一参照 category を優先し categories[0] にフォールバック）
  const usedCategorySlugs = new Set<string>();
  for (const article of articles) {
    const category = article.category ?? article.categories?.[0];
    const mapped = category && findCategoryById(category.id);
    if (mapped) {
      usedCategorySlugs.add(mapped.slug);
    }
  }
  const categoryEntries: MetadataRoute.Sitemap = [...usedCategorySlugs].map(
    (slug) => ({
      url: `${SITE_URL}/category/${slug}`,
    })
  );

  // 著者ページ（記事に紐づく著者IDのみ・Issue #70）
  const authorIds = new Set<string>();
  for (const article of articles) {
    if (article.author?.id) {
      authorIds.add(article.author.id);
    }
  }
  const authorEntries: MetadataRoute.Sitemap = [...authorIds].map((id) => ({
    url: `${SITE_URL}/authors/${id}`,
  }));

  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/about` },
    ...articleEntries,
    ...categoryEntries,
    ...authorEntries,
  ];
}
