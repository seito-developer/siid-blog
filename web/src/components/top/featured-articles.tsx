import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import { getArticleCategory } from "@/libs/article-category";
import { getArticleThumbnail } from "@/libs/article-thumbnail";
import { formatDate } from "@/libs/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FEATURED_ARTICLE_IDS,
  FEATURED_ARTICLES_LIMIT,
} from "./featured-list";

// 注目記事セクション（Issue #64）。
// 手動指定 ID（featured-articles.ts）を優先し、無ければ最新記事にフォールバック。
// 取得失敗・0件時はセクション非表示（return null）。

async function getFeaturedArticles(): Promise<ArticleProps[]> {
  try {
    // 手動指定 ID があれば id で絞り込み、指定順を維持する
    if (FEATURED_ARTICLE_IDS.length > 0) {
      const filters = FEATURED_ARTICLE_IDS.map((id) => `id[equals]${id}`).join(
        "[or]"
      );
      const data = await client.get({
        endpoint: BLOG_API_ENDPOINT,
        queries: { limit: FEATURED_ARTICLE_IDS.length, filters },
      });
      const byId = new Map<string, ArticleProps>(
        (data.contents as ArticleProps[]).map((a) => [a.id, a])
      );
      const ordered = FEATURED_ARTICLE_IDS.map((id) => byId.get(id)).filter(
        (a): a is ArticleProps => Boolean(a)
      );
      if (ordered.length > 0) return ordered;
    }
    // フォールバック: 最新記事
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: { limit: FEATURED_ARTICLES_LIMIT, orders: "-publishedAt" },
    });
    return data.contents as ArticleProps[];
  } catch {
    return [];
  }
}

function FeaturedCard({
  article,
  variant,
}: {
  article: ArticleProps;
  variant: "large" | "small";
}) {
  const category = getArticleCategory(article);
  const thumbnail = getArticleThumbnail(article);
  const isLarge = variant === "large";

  return (
    <Link href={`/${BLOG_API_ENDPOINT}/${article.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative overflow-hidden">
          <Image
            src={thumbnail.url}
            alt={article.title}
            width={thumbnail.width}
            height={thumbnail.height}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isLarge ? "h-56 sm:h-72" : "h-40"
            }`}
            sizes={isLarge ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"}
          />
          {category && (
            <div className="absolute left-3 top-3">
              <Badge
                variant="secondary"
                className="font-medium text-white"
                style={{ backgroundColor: "#289B8F" }}
              >
                {category.name}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3
            className={`font-bold text-[#214a4a] group-hover:opacity-80 ${
              isLarge ? "line-clamp-3 text-xl sm:text-2xl" : "line-clamp-2 text-base"
            }`}
          >
            {article.title}
          </h3>
          <div className="mt-auto flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function FeaturedArticles() {
  const articles = await getFeaturedArticles();
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const smalls = rest.slice(0, 2);

  return (
    <section aria-labelledby="featured-heading" className="py-4">
      <h2
        id="featured-heading"
        className="mb-6 text-2xl font-bold text-[#214a4a]"
      >
        注目記事
      </h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 大カード */}
        <div className="lg:col-span-2">
          <FeaturedCard article={lead} variant="large" />
        </div>
        {/* 小カード（SP では大カードのみ表示し、もっと見るで一覧へ誘導） */}
        <div className="hidden flex-col gap-6 lg:flex">
          {smalls.map((a) => (
            <FeaturedCard key={a.id} article={a} variant="small" />
          ))}
        </div>
      </div>
      {/* SP 用「もっと見る」 */}
      {smalls.length > 0 && (
        <div className="mt-4 text-center lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#214a4a] px-6 py-2 text-sm font-medium text-[#214a4a] transition-colors hover:bg-[#214a4a] hover:text-white"
          >
            記事をもっと見る
          </Link>
        </div>
      )}
    </section>
  );
}
