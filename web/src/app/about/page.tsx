import type { Metadata } from "next";
import Link from "next/link";
import { Youtube } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/app/constants";
import {
  SIID_SITE_URL,
  X_URL,
  YOUTUBE_SEITO_URL,
  YOUTUBE_SIID_URL,
} from "@/app/links";
import JsonLd from "@/components/json-ld";
import Breadcrumbs from "@/components/breadcrumbs";

// 運営者情報ページ（Issue #70）。
// TODO(owner): 会社概要・連絡先・紹介文の正式な文面はオーナー確認のうえ差し替える。
// 現状は公開情報（合同会社BugFix / AIスクールSiiD / セイト先生）に基づく暫定文。

const ABOUT_URL = `${SITE_URL}/about`;

export const metadata: Metadata = {
  title: `運営者情報 | ${SITE_NAME}`,
  description:
    "SiiD BLOG を運営する合同会社BugFix と AIプログラミングスクール SiiD についてのご紹介。エンジニア転職・技術学習の情報を発信しています。",
  alternates: { canonical: ABOUT_URL },
  openGraph: {
    type: "website",
    title: `運営者情報 | ${SITE_NAME}`,
    description:
      "SiiD BLOG を運営する合同会社BugFix と AIプログラミングスクール SiiD についてのご紹介。",
    url: ABOUT_URL,
  },
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

const SNS = [
  { type: "youtube", url: YOUTUBE_SEITO_URL, label: "セイト先生 YouTube" },
  { type: "youtube", url: YOUTUBE_SIID_URL, label: "SiiD YouTube" },
  { type: "x", url: X_URL, label: "X（旧Twitter）" },
] as const;

export default function AboutPage() {
  // AboutPage JSON-LD。Organization 本体は layout.tsx で全ページに出力済み（Issue #59）
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `運営者情報 | ${SITE_NAME}`,
    url: ABOUT_URL,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      <JsonLd data={aboutJsonLd} />
      <Breadcrumbs items={[{ label: "運営者情報", isCurrentPage: true }]} />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#214a4a]">運営者情報</h1>
        <p className="mt-4 leading-relaxed text-gray-700">
          「SiiD BLOG」は、AIプログラミングスクール SiiD を運営する
          合同会社BugFix が発信する、エンジニア転職・技術学習のメディアです。
          「誰が運営し、誰が書いているのか」を明確にし、信頼できる情報をお届けします。
        </p>

        {/* 運営会社 */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#214a4a]">運営会社</h2>
          <dl className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="sm:flex sm:gap-4">
              <dt className="w-32 shrink-0 font-bold text-[#214a4a]">会社名</dt>
              <dd>合同会社BugFix</dd>
            </div>
            <div className="sm:flex sm:gap-4">
              <dt className="w-32 shrink-0 font-bold text-[#214a4a]">事業内容</dt>
              <dd>
                アプリケーション開発・技術顧問、AIプログラミングスクール
                「SiiD」の運営、プログラミング・ITスキル研修
              </dd>
            </div>
            <div className="sm:flex sm:gap-4">
              <dt className="w-32 shrink-0 font-bold text-[#214a4a]">
                公式サイト
              </dt>
              <dd>
                <Link
                  href="https://bug-fix.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#289B8F] underline transition-colors hover:text-[#214a4a]"
                >
                  https://bug-fix.org
                </Link>
              </dd>
            </div>
          </dl>
        </section>

        {/* スクール SiiD */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#214a4a]">
            AIプログラミングスクール SiiD
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            SiiD は、YouTube 登録者数13万人のセイト先生が主任講師を務める
            AIプログラミングスクールです。現役エンジニア＆元人事のプロが、
            未経験からのエンジニア転職を伴走支援します。
          </p>
          <Link
            href={SIID_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center rounded-full bg-[#214a4a] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
          >
            SiiD 公式サイトを見る
          </Link>
        </section>

        {/* 連絡先・SNS */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#214a4a]">お問い合わせ・SNS</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            スクールに関するお問い合わせ・無料相談は
            <Link
              href={SIID_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#289B8F] underline transition-colors hover:text-[#214a4a]"
            >
              SiiD 公式サイト
            </Link>
            より承っています。最新情報は各 SNS でも発信しています。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {SNS.map((s) => (
              <Link
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#289B8F] hover:text-[#214a4a]"
              >
                {s.type === "youtube" ? (
                  <Youtube className="h-4 w-4" aria-hidden />
                ) : (
                  <XIcon className="h-4 w-4" />
                )}
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
