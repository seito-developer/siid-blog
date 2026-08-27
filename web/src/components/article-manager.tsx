"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ArticleProps } from "@/interfaces/common";
import ArticleList from "./article-list";
import { OffsetPagination } from "./ui/offset-pagination";

export default function ArticleManager({
  articles,
  totalCount,
  itemsPerPage,
  headingLevel = "h2",
}: {
  articles: ArticleProps[];
  totalCount: number;
  // 1ページの件数。サーバー側が実際に使った値を必ず渡すこと。
  // 以前は URL の ?perPage= から読んでいたが、サーバーが perPage を
  // 無視するページ（/articles・/category/*）ではページ数・件数表示が
  // 実データとずれ、後半の記事に到達できなくなっていた
  itemsPerPage: number;
  headingLevel?: "h2" | "h3";
}) {
  // トップ（/）・新着記事一覧（/articles）・カテゴリ（/category/*）で
  // 使われるため、リンク先は現在のパスを基準にする
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1
  );

  // q / perPage を保持したままページ番号だけ差し替えた URL を作る
  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      <ArticleList articles={articles} headingLevel={headingLevel} />
      <OffsetPagination
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        buildHref={buildHref}
      />
    </>
  );
}
