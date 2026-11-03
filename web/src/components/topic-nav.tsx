import Link from "next/link";
import { TOPICS } from "@/libs/topics";

// テーマ別まとめページ（/topics/<slug>）への導線。
// TOP・カテゴリ「プログラミング」・各まとめページから張り、技術記事へのリンク経路を増やす
export default function TopicNav({
  currentSlug,
  heading = "テーマ別の記事まとめ",
}: {
  currentSlug?: string;
  heading?: string;
}) {
  const topics = TOPICS.filter((topic) => topic.slug !== currentSlug);
  if (topics.length === 0) return null;

  return (
    <section aria-labelledby="topic-nav-heading">
      <h2 id="topic-nav-heading" className="mb-4 text-2xl font-bold text-siid-text">
        {heading}
      </h2>
      <ul className="flex flex-wrap gap-3">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/topics/${topic.slug}`}
              className="inline-block rounded-full bg-white px-5 py-2 font-bold text-siid-text shadow-sm transition-colors hover:bg-siid-deep hover:text-white"
            >
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
