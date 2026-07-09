import type { MetadataRoute } from "next";
import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT, SITE_URL } from "./constants";
import { findCategoryById } from "./category/categories";

// 1日1回再生成する（記事の追加・更新はこの周期で sitemap に反映される）
export const revalidate = 86400;

type SitemapArticle = {
  id: string;
  revisedAt?: string;
  categories?: { id: string }[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await client.getAllContents<SitemapArticle>({
    endpoint: BLOG_API_ENDPOINT,
    queries: { fields: "id,revisedAt,categories" },
  });

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/blog/${article.id}`,
    lastModified: article.revisedAt,
  }));

  // 記事が1件以上あり、スラッグ対応表に載っているカテゴリのみを列挙する
  const usedCategorySlugs = new Set<string>();
  for (const article of articles) {
    for (const category of article.categories ?? []) {
      const mapped = findCategoryById(category.id);
      if (mapped) {
        usedCategorySlugs.add(mapped.slug);
      }
    }
  }
  const categoryEntries: MetadataRoute.Sitemap = [...usedCategorySlugs].map(
    (slug) => ({
      url: `${SITE_URL}/category/${slug}`,
    })
  );

  return [{ url: SITE_URL }, ...articleEntries, ...categoryEntries];
}
