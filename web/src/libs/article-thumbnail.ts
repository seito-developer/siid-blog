import { ArticleProps, EyecatchProps } from "@/interfaces/common";

// サムネイルのジャンル（Issue #13 / PR #34）。
// microCMS の必須セレクトフィールド thumbnailPreset の選択肢（value）と
// 一致させること。画像は web/public/thumbnails/<file>.png（1200x630）
export const THUMBNAIL_GENRES = [
  { value: "Tech", file: "tech" },
  { value: "Learning", file: "learning" },
  { value: "Career", file: "career" },
  { value: "Frontend", file: "frontend" },
  { value: "Backend", file: "backend" },
  { value: "AI", file: "ai" },
] as const;

const PRESET_SIZE = { width: 1200, height: 630 };

// 記事のサムネイルを返す。
// 優先順: ①アップロードされた eyecatch ②microCMS で選んだジャンルの画像
// ③記事 ID から決まる既定画像（旧記事などフィールド未設定でも壊れない）
export function getArticleThumbnail(
  article: Pick<ArticleProps, "id" | "eyecatch" | "thumbnailPreset">
): EyecatchProps {
  if (article.eyecatch?.url) {
    return article.eyecatch;
  }
  const file =
    genreFile(article.thumbnailPreset) ?? fileByArticleId(article.id);
  return { url: `/thumbnails/${file}.png`, ...PRESET_SIZE };
}

// microCMS のセレクトフィールドは string[] で返る（単数選択でも配列）。
// 未知の値・未設定は undefined
function genreFile(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return THUMBNAIL_GENRES.find((genre) => genre.value === first)?.file;
}

// 記事 ID のハッシュで画像を決める（同じ記事は常に同じ画像になる）
function fileByArticleId(id: string): string {
  let hash = 0;
  for (const ch of id) {
    hash = (hash + ch.charCodeAt(0)) % THUMBNAIL_GENRES.length;
  }
  return THUMBNAIL_GENRES[hash].file;
}
