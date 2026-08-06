import { AuthorProps } from "@/interfaces/common";

// AI 著者「シンディ」かどうかの判定（Issue #60）。
// microCMS 上の表記ゆれ（「SiiD BLOG編集部」）を吸収するため
// 名前に「SiiD BLOG編集部」を含むかで判定する。著者未設定（デフォルト著者）も AI 扱い。
export function isAiAuthor(author: AuthorProps | null | undefined): boolean {
  if (!author) {
    return true;
  }
  return author.name.includes("SiiD BLOG編集部");
}

// 実在著者「セイト先生」かどうか。JSON-LD の sameAs（YouTube / X）を
// 本人のアカウントに限って付与するために使う
export function isSeitoAuthor(author: AuthorProps | null | undefined): boolean {
  return !!author && author.name.includes("セイト");
}
