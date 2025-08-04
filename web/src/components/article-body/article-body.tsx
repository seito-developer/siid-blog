import "./article-body.css";
import { Inter } from "next/font/google"

const notoSansJP = Inter({ subsets: ["latin"] })

import React, { ReactNode } from "react";
import ArticleFooter from "./article-footer";
import ArticleHeader from "./article-header";
import { decode } from "html-entities";
import { AuthorProps } from "@/interfaces/common";

type ArticleBodyProps = {
  children: ReactNode;
  author: AuthorProps | null;
};

export default function ArticleBody({ children, author }: ArticleBodyProps) {
  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 ${notoSansJP.className}`}>
      {/* Article Body Content */}
      <article className="prose prose-lg max-w-none">
        <div className="article-body space-y-6">
          {author?.name === "AI講師シンディ" &&  (
            <ArticleHeader />
          )}
          <div dangerouslySetInnerHTML={{ __html: decode(children as string) || ''}} />
          <ArticleFooter />
        </div>
      </article>
    </div>
  )
}
