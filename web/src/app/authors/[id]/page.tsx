import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Youtube } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/app/constants";
import JsonLd from "@/components/json-ld";
import Breadcrumbs from "@/components/breadcrumbs";
import ArticleList from "@/components/article-list";
import { getAuthorIds, getAuthorPageData } from "@/libs/authors";
import { getAuthorSocials, isAiAuthor } from "@/libs/author";

type Props = { params: Promise<{ id: string }> };

// X（旧Twitter）ロゴは lucide-react に無いため簡易 SVG
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

// 著者名義の記事があるIDのみ静的生成する
export async function generateStaticParams() {
  const ids = await getAuthorIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getAuthorPageData(id);
  if (!data) {
    return { title: `著者が見つかりません | ${SITE_NAME}` };
  }
  const { author } = data;
  const description =
    author.description?.replace(/\s+/g, " ").trim().slice(0, 120) ||
    `${author.name} の記事一覧`;
  const url = `${SITE_URL}/authors/${id}`;
  return {
    title: `${author.name} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: `${author.name} | ${SITE_NAME}`,
      description,
      url,
      ...(author.image?.url ? { images: [{ url: author.image.url }] } : {}),
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const data = await getAuthorPageData(id);
  if (!data) {
    notFound();
  }
  const { author, articles } = data;
  const isAi = isAiAuthor(author);
  const socials = getAuthorSocials(author);
  const imageUrl = author.image?.url || (isAi ? "/sindi.png" : null);
  const authorUrl = `${SITE_URL}/authors/${id}`;

  // ProfilePage / Person JSON-LD（Issue #70）。
  // AI 著者は実在人物と誤認されないよう Person を出さない（Issue #60）。
  const profileJsonLd = isAi
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: author.name,
          ...(author.description ? { description: author.description } : {}),
          ...(author.image?.url ? { image: author.image.url } : {}),
          url: authorUrl,
          ...(socials.length > 0
            ? { sameAs: socials.map((s) => s.url) }
            : {}),
          worksFor: { "@id": `${SITE_URL}/#organization` },
        },
      };

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      {profileJsonLd && <JsonLd data={profileJsonLd} />}
      <Breadcrumbs items={[{ label: author.name, isCurrentPage: true }]} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* プロフィール */}
        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#289B8F] bg-gray-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <User className="h-full w-full p-6 text-gray-400" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-[#214a4a] sm:justify-start">
                {author.name}
                {isAi && (
                  <span className="rounded-full bg-[#214a4a] px-2.5 py-0.5 text-xs font-medium text-white">
                    AIアシスタント
                  </span>
                )}
              </h1>
              {author.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {author.description}
                </p>
              )}
              {socials.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
                  {socials.map((s) => (
                    <Link
                      key={s.type}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${author.name} の ${s.label}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#289B8F] hover:bg-[#289B8F] hover:text-white"
                    >
                      {s.type === "youtube" ? (
                        <Youtube className="h-5 w-5" aria-hidden />
                      ) : (
                        <XIcon className="h-4 w-4" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 著者名義の記事一覧 */}
        <section aria-label={`${author.name} の記事`} className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-[#214a4a]">
            {author.name} の記事（{articles.length}）
          </h2>
          <ArticleList articles={articles} headingLevel="h3" />
        </section>
      </div>
    </main>
  );
}
