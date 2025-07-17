"use client";

import { ArticleProps } from "@/interfaces/common";
import ArticleList from "./article-list";
import { OffsetPagination } from "./ui/offset-pagination";
import { usePages } from "@/hooks/usePages";

export default function ArticleManager({
  articles,
  totalCount,
}: {
  articles: ArticleProps[];
  totalCount: number;
}) {
  const { offsetCurrentPage, clickPage } = usePages();

  return (
    <>
      <ArticleList articles={articles} />
      <OffsetPagination
        totalItems={totalCount}
        itemsPerPage={10}
        currentPage={offsetCurrentPage}
        onPageChange={clickPage}
      />
    </>
  );
}
