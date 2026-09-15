import type { MetadataRoute } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { client } from "@/libs/microcms";
import { fetchAllPages } from "@/libs/fetch-all-pages";
import { BLOG_API_ENDPOINT, SITE_URL } from "./constants";
import { CATEGORIES, findCategoryById } from "./category/categories";

// 1日1回再生成する（記事の追加・更新はこの周期で sitemap に反映される）
export const revalidate = 86400;

type SitemapArticle = {
  id: string;
  revisedAt?: string;
  category?: { id: string }; // 新スキーマ: 単一参照
  categories?: { id: string }[]; // 旧スキーマ: 複数参照
};

const staticEntries: MetadataRoute.Sitemap = [
  { url: SITE_URL },
  // 新着記事一覧（Issue #94）
  { url: `${SITE_URL}/articles` },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: SitemapArticle[];
  try {
    articles = await fetchAllPages(
      (offset, limit) =>
        client.getList<SitemapArticle>({
          endpoint: BLOG_API_ENDPOINT,
          queries: { fields: "id,revisedAt,categories,category", offset, limit },
        }),
      { label: "sitemap" }
    );
  } catch (error) {
    console.error("[sitemap] microCMS から記事一覧を取得できませんでした:", error);
    // ビルド中はここで止めるとデプロイ全体が失敗するため、最小限の URL だけで生成を続ける（#104）。
    // 実行時（ISR の再生成）は throw して、前回生成済みの sitemap を配信し続けてもらう
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
      return [
        ...staticEntries,
        ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/category/${c.slug}` })),
      ];
    }
    throw error;
  }

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

  return [...staticEntries, ...articleEntries, ...categoryEntries];
}
