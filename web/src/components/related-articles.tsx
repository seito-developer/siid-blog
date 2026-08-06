import Image from "next/image";
import Link from "next/link";
import { ArticleProps } from "@/interfaces/common";
import { getArticleThumbnail } from "@/libs/article-thumbnail";
import ArticleList from "./article-list";

// 関連記事セクション（Issue #56 / #66）。
// データ取得は libs/related-articles.ts に切り出し、ここは表示のみ担う。
// - variant="grid": 本文末（SP）向けの3カラムカード
// - variant="sidebar": PC サイドバー向けの縦積みコンパクト表示

type Props = {
  articles: ArticleProps[];
  variant?: "grid" | "sidebar";
};

export default function RelatedArticles({ articles, variant = "grid" }: Props) {
  if (articles.length === 0) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <section aria-label="関連記事">
        <h2 className="mb-4 text-base font-bold text-[#214a4a]">関連記事</h2>
        <ul className="space-y-4">
          {articles.map((article) => {
            const thumbnail = getArticleThumbnail(article);
            return (
              <li key={article.id}>
                <Link href={`/blog/${article.id}`} className="group flex gap-3">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={thumbnail.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <span className="line-clamp-3 text-sm leading-snug text-gray-700 transition-colors group-hover:text-[#214a4a]">
                    {article.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section aria-label="関連記事" className="pb-16">
      <h2 className="mb-6 text-2xl font-bold text-[#214a4a]">関連記事</h2>
      <ArticleList articles={articles} headingLevel="h3" />
    </section>
  );
}
