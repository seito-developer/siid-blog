"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ArticleProps } from "@/interfaces/common";
import { POSTS_NUM_PER_PAGE } from "@/app/constants";
import ArticleList from "./article-list";
import { OffsetPagination } from "./ui/offset-pagination";

export default function ArticleManager({
  articles,
  totalCount,
}: {
  articles: ArticleProps[];
  totalCount: number;
}) {
  // トップ（/）とカテゴリ（/category/*）の両方で使われるため、
  // リンク先は現在のパスを基準にする
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1
  );
  const itemsPerPage = Math.max(
    1,
    parseInt(searchParams.get("perPage") ?? "", 10) || POSTS_NUM_PER_PAGE
  );

  // q / perPage を保持したままページ番号だけ差し替えた URL を作る
  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      <ArticleList articles={articles} />
      <OffsetPagination
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        buildHref={buildHref}
      />
    </>
  );
}
