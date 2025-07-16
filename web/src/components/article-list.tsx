'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ArticleProps } from "@/interfaces/common"
import { BLOG_API_ENDPOINT } from "@/app/constants"
import { useState } from "react";
import { OffsetPagination } from "./ui/offset-pagination";

export default function ArticleList({ articles, totalCount }: { articles: ArticleProps[], totalCount: number }) {
  const [offsetCurrentPage, setOffsetCurrentPage] = useState<number>(1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F4F4", fontFamily: "Noto Sans JP, sans-serif" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#214a4a" }}>
            記事一覧
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Web開発、デザイン、UXに関する最新の記事をお届けします
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: ArticleProps) => (
            <Link key={article.id} href={`/${BLOG_API_ENDPOINT}/${article.id}`} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-0 shadow-sm">
                {/* Article Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={article.eyecatch.url || ""}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    width={article.eyecatch.width}
                    height={article.eyecatch.height}
                    objectFit="cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="text-white font-medium"
                      style={{ backgroundColor: "#289B8F" }}
                    >
                      {article.categories[0].name}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-lg font-bold line-clamp-2 group-hover:text-opacity-80 transition-colors"
                    style={{ color: "#214a4a" }}
                  >
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs border-gray-300 text-gray-600 hover:border-gray-400"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

      </div>

      <OffsetPagination
        totalItems={totalCount}
        itemsPerPage={10}
        currentPage={offsetCurrentPage}
        onPageChange={setOffsetCurrentPage}
      />
    </div>
  )
}
