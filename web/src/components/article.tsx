import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import { getArticleCategory } from "@/libs/article-category";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Calendar, User } from "lucide-react";

export default function Article({ article }: { article: ArticleProps }) {
  const category = getArticleCategory(article);

  return (
    <article>
      {/* 記事カードは独立したコンテンツなので article 要素にする */}
      <Link
        key={article.id}
      href={`/${BLOG_API_ENDPOINT}/${article.id}`}
      className="group block h-full"
    >
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
          {/* カテゴリ未設定の記事はバッジを出さない（従来はここでクラッシュしていた） */}
          {category && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="text-white font-medium"
                style={{ backgroundColor: "#289B8F" }}
              >
                {category.name}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          {/* 記事タイトルは見出し要素にする（SEO・アクセシビリティ） */}
          <h2
            data-slot="card-title"
            className="leading-none font-semibold text-lg font-bold line-clamp-2 group-hover:text-opacity-80 transition-colors"
            style={{ color: "#214a4a" }}
          >
            {article.title}
          </h2>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Article Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{article.author?.name || "AI講師 シンディ"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
    </article>
  );
}
