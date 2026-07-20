import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import Author from "./author"
import { AuthorProps } from "@/interfaces/common"

interface BlogHeaderProps {
  eyecatchImage: string
  author: AuthorProps
  category: string
  categoryHref?: string // カテゴリ一覧ページへのリンク（対応表に無いカテゴリは undefined）
  date: string
  title: string
}

export default function BlogHeader({
  eyecatchImage,
  author,
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
      {/* Eyecatch Image */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        {/* アイキャッチはビューポート全幅のヒーロー（2カラム化後も本文上の全幅表示） */}
        <Image
          src={eyecatchImage || "/placeholder.svg"}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

        {/* Title overlay on image */}
        <div className="py-4  bottom-8 left-8 right-8 text-white bg-[#214a4a]">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-6xl mx-auto px-6"
            style={{ fontFamily: "Noto Sans JP, sans-serif" }}
          >
            {title}
          </h1>
        </div>

      {/* Article Meta Information */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-row lg:items-center justify-between gap-6">
          {/* Author and Date Info */}
          <Author postDate={date} author={author}  />

          {/* Category */}
          <div className="flex flex-wrap items-center gap-3">
            {categoryHref ? (
              <Link href={categoryHref}>{categoryBadge}</Link>
            ) : (
              categoryBadge
            )}
          </div>
          <div className="max-w-2xl hidden lg:block"></div>
        </div>
      </div>
    </header>
  )
}