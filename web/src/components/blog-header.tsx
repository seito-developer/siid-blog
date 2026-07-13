import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import Author from "./author"
import { AuthorProps } from "@/interfaces/common"

interface BlogHeaderProps {
  eyecatchImage: string
  author: AuthorProps
  category: string
  date: string
  title: string
}

export default function BlogHeader({
  eyecatchImage,
  author,
  category,
  date,
  title,
}: BlogHeaderProps) {
  return (
    <header className="w-full bg-[#F4F4F4]">
      {/* Eyecatch Image */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        <Image src={eyecatchImage || "/placeholder.svg"} alt={title} fill className="object-cover" priority />
      </div>

        {/* Title overlay on image */}
        <div className="p-4  bottom-8 left-8 right-8 text-white bg-[#214a4a]">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl mx-auto"
            style={{ fontFamily: "Noto Sans JP, sans-serif" }}
          >
            {title}
          </h1>
        </div>

      {/* Article Meta Information */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Author and Date Info */}
          <Author postDate={date} author={author}  />

          {/* Category */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-[#214a4a] text-white hover:bg-[#214a4a]/90 px-3 py-1"
              style={{ fontFamily: "Noto Sans JP, sans-serif" }}
            >
              {category}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}