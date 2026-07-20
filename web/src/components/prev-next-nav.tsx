import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleProps } from "@/interfaces/common";
import { getArticleThumbnail } from "@/libs/article-thumbnail";
import type { AdjacentArticles } from "@/libs/adjacent-articles";

// 前後記事ナビ（Issue #71）。記事末（関連記事の下）に配置。
// prev = 前の記事（1つ古い）、next = 次の記事（1つ新しい）。
// 片側が無い場合はもう片側のみ表示。SP は縦積み。

function NavCard({
  article,
  direction,
}: {
  article: ArticleProps;
  direction: "prev" | "next";
}) {
  const thumbnail = getArticleThumbnail(article);
  const isPrev = direction === "prev";

  return (
    <Link
      href={`/blog/${article.id}`}
      className={`group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#289B8F] ${
        isPrev ? "" : "sm:flex-row-reverse sm:text-right"
      }`}
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
        <Image
          src={thumbnail.url}
          alt=""
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="min-w-0">
        <span
          className={`flex items-center gap-1 text-xs font-medium text-gray-500 ${
            isPrev ? "" : "sm:justify-end"
          }`}
        >
          {isPrev ? (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              前の記事
            </>
          ) : (
            <>
              次の記事
              <ChevronRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </span>
        <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#214a4a]">
          {article.title}
        </span>
      </div>
    </Link>
  );
}

export default function PrevNextNav({ prev, next }: AdjacentArticles) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      aria-label="前後の記事"
      className="max-w-4xl mx-auto px-6 pb-16"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 前が無い場合も次を右側に保つためのプレースホルダ */}
        {prev ? <NavCard article={prev} direction="prev" /> : <span className="hidden sm:block" aria-hidden />}
        {next ? <NavCard article={next} direction="next" /> : <span className="hidden sm:block" aria-hidden />}
      </div>
    </nav>
  );
}
