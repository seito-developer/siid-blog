import "./article-body.css";
import { Inter } from "next/font/google"

const notoSansJP = Inter({ subsets: ["latin"] })

import React, { ReactNode } from "react";
import ArticleFooter from "./article-footer";
import ArticleHeader from "./article-header";
import { decode } from "html-entities";

type ArticleBodyProps = {
  children: ReactNode;
};

export default function ArticleBody({ children }: ArticleBodyProps) {
  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 ${notoSansJP.className}`}>
      {/* Article Body Content */}
      <article className="prose prose-lg max-w-none">
        <div className="article-body space-y-6">
          <ArticleHeader />
          <div dangerouslySetInnerHTML={{ __html: decode(children as string) || ''}} />
          <ArticleFooter />
        </div>
      </article>
    </div>
  )
}
