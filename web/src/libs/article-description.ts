// 記事の meta description / og:description 用テキストを組み立てる。
// 優先順: ①microCMS の説明文フィールド（excerpt） ②本文の先頭を文末で切り詰めた要約
const MAX_LENGTH = 120;
// 文末で切ると短くなりすぎる場合は従来どおり末尾を省略記号にする
const MIN_SENTENCE_CUT = 40;

export function buildArticleDescription(
  excerpt: string | undefined,
  plainTextContent: string
): string {
  const fromField = excerpt?.trim();
  if (fromField) {
    return fromField;
  }

  const text = plainTextContent.replace(/\s+/g, " ").trim();
  if (text.length <= MAX_LENGTH) {
    return text;
  }

  const head = text.slice(0, MAX_LENGTH);
  const lastSentenceEnd = Math.max(
    head.lastIndexOf("。"),
    head.lastIndexOf("！"),
    head.lastIndexOf("？")
  );
  if (lastSentenceEnd >= MIN_SENTENCE_CUT) {
    return head.slice(0, lastSentenceEnd + 1);
  }
  return head + "…";
}
