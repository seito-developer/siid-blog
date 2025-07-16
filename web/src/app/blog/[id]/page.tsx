import BlogHeader from "@/components/blog-header"

export default function BlogArticlePage() {
  // Sample data - in a real app, this would come from your CMS or API
  const blogData = {
    eyecatchImage: "/placeholder.svg?height=600&width=1200",
    authorImage: "/placeholder.svg?height=100&width=100",
    authorName: "田中太郎",
    tags: ["技術", "デザイン", "開発"],
    category: "テクノロジー",
    date: "2024年1月15日",
    title: "モダンなWebデザインの最新トレンドと実装方法について",
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <BlogHeader
        eyecatchImage={blogData.eyecatchImage}
        authorImage={blogData.authorImage}
        authorName={blogData.authorName}
        tags={blogData.tags}
        category={blogData.category}
        date={blogData.date}
        title={blogData.title}
      />

      {/* Article content would go here */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>
            ここに記事の本文が入ります...
          </p>
        </div>
      </main>
    </div>
  )
}
