import { AuthorProps } from "@/interfaces/common";
import { X_URL, YOUTUBE_SEITO_URL } from "@/app/links";

// AI 著者「シンディ」かどうかの判定（Issue #60）。
// microCMS 上の表記ゆれ（「AI講師 シンディ」「AI講師シンディ」）を吸収するため
// 名前に「シンディ」を含むかで判定する。著者未設定（デフォルト著者）も AI 扱い。
export function isAiAuthor(author: AuthorProps | null | undefined): boolean {
  if (!author) {
    return true;
  }
  return author.name.includes("シンディ");
}

// 実在著者「セイト先生」かどうか。JSON-LD の sameAs（YouTube / X）を
// 本人のアカウントに限って付与するために使う
export function isSeitoAuthor(author: AuthorProps | null | undefined): boolean {
  return !!author && author.name.includes("セイト");
}

// 著者の SNS 導線（Issue #70）。microCMS の著者データに SNS フィールドが無いため
// コードで導出する。本人アカウントに限定するため実在著者（セイト先生）のみ付与し、
// AI 著者には個人 SNS を出さない（実在人物との誤認を避ける・Issue #60）。
export type AuthorSocial = {
  type: "youtube" | "x";
  url: string;
  label: string;
};

export function getAuthorSocials(
  author: AuthorProps | null | undefined
): AuthorSocial[] {
  if (isSeitoAuthor(author)) {
    return [
      { type: "youtube", url: YOUTUBE_SEITO_URL, label: "YouTube" },
      { type: "x", url: X_URL, label: "X（旧Twitter）" },
    ];
  }
  return [];
}
