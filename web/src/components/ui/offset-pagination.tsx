import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  // ページ番号から遷移先 URL を組み立てる（q / perPage 等の引き継ぎは呼び出し側で行う）
  buildHref: (page: number) => string
}

// クローラーが2ページ目以降を辿れるよう、ページ送りは <a href> で出力する（Issue #36）。
// JSX 上は <Button> だが、asChild 指定時は button 要素ではなく子の <Link>（= <a>）が
// そのままレンダリングされる（shadcn/ui の Slot パターン）。実 DOM に button が
// 残るのは、リンクを持たせない先頭ページの Prev / 末尾ページの Next だけ。

export function OffsetPagination({ totalItems, itemsPerPage, currentPage: rawCurrentPage, buildHref }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  // URL 直叩きで page が範囲外でも実在ページの範囲に丸める
  const currentPage = Math.min(Math.max(1, rawCurrentPage), Math.max(1, totalPages))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  // 0件・ページ超過時に存在しないページへの <a href> を出さない
  // （クローラーの無限クロールトラップ防止）
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisible - 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <nav aria-label="ページ送り" className="w-full py-5" style={{ backgroundColor: "#F4F4F4" }}>

      <div className="space-y-4">
        <div className="text-sm" style={{ color: "#000", textAlign: "center" }}>
          {startItem}-{endItem} / {totalItems} Articles
        </div>

        {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {!hasPrev ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              style={{ borderColor: "#214a4a", color: "#999" }}
            >
              Prev
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              style={{ cursor: "pointer", borderColor: "#214a4a", color: "#214a4a" }}
            >
              <Link href={buildHref(currentPage - 1)} scroll={false} rel="prev">
                Prev
              </Link>
            </Button>
          )}

          {getPageNumbers().map((page) => (
            <Button
              key={page}
              asChild
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              style={
                currentPage === page
                  ? {
                      backgroundColor: "#289B8F",
                      borderColor: "#289B8F",
                      color: "#fff",
                    }
                  : {
                      cursor: 'pointer',
                      borderColor: "#214a4a",
                      color: "#214a4a",
                    }
              }
            >
              <Link
                href={buildHref(page)}
                scroll={false}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </Link>
            </Button>
          ))}

          {!hasNext ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              style={{ borderColor: "#214a4a", color: "#999" }}
            >
              Next
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              style={{ cursor: "pointer", borderColor: "#214a4a", color: "#214a4a" }}
            >
              <Link href={buildHref(currentPage + 1)} scroll={false} rel="next">
                Next
              </Link>
            </Button>
          )}
        </div>
        )}
      </div>
    </nav>
  )
}
