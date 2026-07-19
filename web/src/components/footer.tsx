import Link from "next/link";
import { Youtube } from "lucide-react";
import { client } from "@/libs/microcms";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { CATEGORIES } from "@/app/category/categories";
import {
  SIID_SITE_URL,
  X_URL,
  YOUTUBE_SEITO_URL,
  YOUTUBE_SIID_URL,
} from "@/app/links";
import { ArticleProps } from "@/interfaces/common";

// サイト共通フッター（Issue #65 で強化）。全ページ（記事詳細含む）で使用。
// カテゴリ / 注目記事（最新記事）/ SNS / 運営者情報。
// 注目記事は取得失敗してもフッター全体を落とさない（try/catch）。

const FOOTER_ARTICLES_LIMIT = 5;

async function getFooterArticles(): Promise<ArticleProps[]> {
  try {
    const data = await client.get({
      endpoint: BLOG_API_ENDPOINT,
      queries: { limit: FOOTER_ARTICLES_LIMIT, orders: "-publishedAt", fields: "id,title" },
    });
    return data.contents as ArticleProps[];
  } catch {
    return [];
  }
}

// X（旧Twitter）ロゴは lucide-react に無いため簡易 SVG で用意
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export default async function Footer() {
  const articles = await getFooterArticles();

  return (
    <footer className="mt-auto bg-[#214a4a] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* サイト情報 + SNS */}
          <div>
            <p className="text-lg font-bold">SiiD BLOG</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              AIプログラミングスクール SiiD が発信する、エンジニア転職・技術学習のメディア。
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href={YOUTUBE_SEITO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="セイト先生の YouTube チャンネル"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <Youtube className="h-6 w-6" />
              </Link>
              <Link
                href={YOUTUBE_SIID_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SiiD の YouTube チャンネル"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <Youtube className="h-6 w-6" />
              </Link>
              <Link
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X（旧Twitter）"
                className="text-gray-300 transition-colors hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* カテゴリ */}
          <nav aria-label="カテゴリ">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-200">
              カテゴリ
            </p>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 注目記事（最新記事） */}
          {articles.length > 0 && (
            <nav aria-label="注目記事">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-200">
                注目記事
              </p>
              <ul className="mt-3 space-y-2">
                {articles.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/${BLOG_API_ENDPOINT}/${a.id}`}
                      className="line-clamp-1 text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* 運営者情報 */}
          <nav aria-label="運営者情報">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-200">
              運営者情報
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={SIID_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  SiiD 公式サイト
                </Link>
              </li>
              <li>
                <Link
                  href="https://bug-fix.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  運営会社 BugFix
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-center text-sm text-gray-300">
          &copy; 2025 SiiD Blog. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
