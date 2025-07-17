import { Button } from "@/components/ui/button"

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function OffsetPagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
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
    <div className="w-full py-5" style={{ backgroundColor: "#F4F4F4" }}>
      
      <div className="space-y-4">
        <div className="text-sm" style={{ color: "#000", textAlign: "center" }}>
          {startItem}-{endItem} / {totalItems} Pages
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              cursor: 'pointer',
              borderColor: "#214a4a",
              color: currentPage === 1 ? "#999" : "#214a4a",
            }}
          >
            Prev
          </Button>

          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
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
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              cursor: 'pointer',
              borderColor: "#214a4a",
              color: currentPage === totalPages ? "#999" : "#214a4a",
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
