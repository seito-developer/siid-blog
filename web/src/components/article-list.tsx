import { ArticleProps } from "@/interfaces/common"
import Article from "./article";

export default function ArticleList({
  articles,
  headingLevel = "h2",
}: {
  articles: ArticleProps[];
  headingLevel?: "h2" | "h3";
}) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: ArticleProps) => (
          <Article article={article} key={article.id} headingLevel={headingLevel} />
        ))}
      </div>
  )
}
