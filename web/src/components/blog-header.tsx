import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import Author from "./author"
import { AuthorProps, TagProps } from "@/interfaces/common"

interface BlogHeaderProps {
  eyecatchImage: string
  author: AuthorProps
  tags: TagProps[]
  category: string
  date: string
  title: string
}

export default function BlogHeader({
  eyecatchImage,
  author,
  tags,
  category,
  date,
  title,
}: BlogHeaderProps) {
  return (
    <header className="w-full bg-[#F4F4F4]">
      {/* Eyecatch Image */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image src={eyecatchImage || "/placeholder.svg"} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Title overlay on image */}
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Noto Sans JP, sans-serif" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Article Meta Information */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Author and Date Info */}
          <Author postDate={date} author={author}  />

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Badge */}
            <Badge
              variant="secondary"
              className="bg-[#214a4a] text-white hover:bg-[#214a4a]/90 px-3 py-1"
              style={{ fontFamily: "Noto Sans JP, sans-serif" }}
            >
              {category}
            </Badge>

            {/* Tag Badges */}
            {tags.map((tag: TagProps, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="border-[#289B8F] text-[#289B8F] hover:bg-[#289B8F] hover:text-white px-3 py-1"
                style={{ fontFamily: "Noto Sans JP, sans-serif" }}
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}