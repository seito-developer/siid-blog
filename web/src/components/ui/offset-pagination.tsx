import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  // ページ番号から遷移先 URL を組み立てる（q / perPage 等の引き継ぎは呼び出し側で行う）
  buildHref: (page: number) => string
}

export function OffsetPagination({ totalItems, itemsPerPage, currentPage, buildHref }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

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

        <div className="flex items-center justify-center gap-2">
          {currentPage === 1 ? (
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

          {currentPage === totalPages ? (
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
      </div>
    </nav>
  )
}
