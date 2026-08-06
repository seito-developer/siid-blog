import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/libs/utils"

interface BlogHeaderProps {
  category: string
  categoryHref?: string // カテゴリ一覧ページへのリンク（対応表に無いカテゴリは undefined）
  date: string
  title: string
}

// 記事ヘッダー: タイトル → 投稿日時・カテゴリ。
// サムネイルと著者情報はヘッダーから外し、本文カラム側で表示する（Issue #90）
export default function BlogHeader({
  category,
  categoryHref,
  date,
  title,
}: BlogHeaderProps) {
  const categoryBadge = (
    <Badge
      variant="secondary"
      className="bg-[#214a4a] text-white hover:bg-[#214a4a]/90 px-3 py-1"
      style={{ fontFamily: "Noto Sans JP, sans-serif" }}
    >
      {category}
    </Badge>
  )
  return (
    <header className="w-full bg-[#F4F4F4]">
      {/* Title */}
      <div className="py-4 text-white bg-[#214a4a]">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-6xl mx-auto px-6"
          style={{ fontFamily: "Noto Sans JP, sans-serif" }}
        >
          {title}
        </h1>
      </div>

      {/* Article Meta Information */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-row items-center gap-4">
          <time
            className="text-sm text-gray-600"
            style={{ fontFamily: "Noto Sans JP, sans-serif" }}
          >
            {formatDate(date)}
          </time>
          {categoryHref ? (
            <Link href={categoryHref}>{categoryBadge}</Link>
          ) : (
            categoryBadge
          )}
        </div>
      </div>
    </header>
  )
}
