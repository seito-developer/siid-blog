import "./article-body.css";
import { Inter } from "next/font/google";

const notoSansJP = Inter({ subsets: ["latin"] });

import ArticleHeader from "./article-header";
import InlineCta from "@/components/inline-cta";
import { AuthorProps } from "@/interfaces/common";
import { isAiAuthor } from "@/libs/author";

// 記事本文（Issue #67 / #69）。
// 本文は buildArticleContent で「サニタイズ → 見出し id 付与 → h2 区切り分割」した
// segments を受け取り描画する（サニタイズは必ず経由済み）。
// inlineCtaIndex が指定された場合、そのセグメントの直後で本文を2ブロックに分け、
// 間に本文途中 CTA（#69）を差し込む。CTA は .article-body の外に置き、
// 本文用のスコープ済みスタイル（.article-body a など）の影響を受けないようにする。

type ArticleBodyProps = {
  segments: string[];
  author: AuthorProps | null;
  slug: string;
  inlineCtaIndex: number | null;
};

export default function ArticleBody({
  segments,
  author,
  slug,
  inlineCtaIndex,
}: ArticleBodyProps) {
  const showInline =
    inlineCtaIndex !== null &&
    inlineCtaIndex >= 0 &&
    inlineCtaIndex < segments.length - 1;

  const beforeHtml = showInline
    ? segments.slice(0, inlineCtaIndex + 1).join("")
    : segments.join("");
  const afterHtml = showInline ? segments.slice(inlineCtaIndex + 1).join("") : "";

  return (
    <div className={`max-w-4xl mx-auto px-6 lg:px-0 pb-8 ${notoSansJP.className}`}>
      {/* Article Body Content */}
      <article className="prose prose-lg max-w-none space-y-8">
        <div className="article-body">
          {/* 表記ゆれを吸収するため isAiAuthor で判定（従来は完全一致で表示されないことがあった） */}
          {isAiAuthor(author) && <ArticleHeader />}
          <div dangerouslySetInnerHTML={{ __html: beforeHtml }} />
        </div>

        {showInline && (
          <>
            <InlineCta slug={slug} />
            <div className="article-body">
              <div dangerouslySetInnerHTML={{ __html: afterHtml }} />
            </div>
          </>
        )}
      </article>
    </div>
  );
}
