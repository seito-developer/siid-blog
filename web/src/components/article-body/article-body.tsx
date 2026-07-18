import "./article-body.css";
import { Inter } from "next/font/google";

const notoSansJP = Inter({ subsets: ["latin"] });

import React, { ReactNode } from "react";
import ArticleHeader from "./article-header";
import { AuthorProps } from "@/interfaces/common";
import { isAiAuthor } from "@/libs/author";
import { sanitizeArticleHtml } from "./sanitize-article-html";

type ArticleBodyProps = {
  children: ReactNode;
  author: AuthorProps | null;
};

export default function ArticleBody({ children, author }: ArticleBodyProps) {
  const raw = typeof children === "string" ? children : "";
  const safeHtml = sanitizeArticleHtml(raw);

  return (
    <div className={`max-w-4xl mx-auto px-6 pb-8 ${notoSansJP.className}`}>
      {/* Article Body Content */}
      <article className="prose prose-lg max-w-none">
        <div className="article-body space-y-6">
          {/* 表記ゆれを吸収するため isAiAuthor で判定（従来は完全一致で表示されないことがあった） */}
          {isAiAuthor(author) && <ArticleHeader />}
          <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
        </div>
      </article>
    </div>
  );
}
