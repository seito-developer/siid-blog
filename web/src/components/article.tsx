import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Calendar, User } from "lucide-react";

export default function Article({ article }: { article: ArticleProps }) {

  return (
    <Link
      key={article.id}
      href={`/${BLOG_API_ENDPOINT}/${article.id}`}
      className="group"
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
  );
}
