import { ArticleProps, EyecatchProps } from "@/interfaces/common";

// プリセットサムネイル（web/public/thumbnails/*.png、1200x630）。
// microCMS のセレクトフィールド thumbnailPreset の選択肢と一致させること
export const THUMBNAIL_PRESETS = [
  "preset-01",
  "preset-02",
  "preset-03",
  "preset-04",
] as const;

const PRESET_SIZE = { width: 1200, height: 630 };

// 記事のサムネイルを返す（Issue #13 / zenn.dev 風のプリセット方式）。
// 優先順: ①アップロードされた eyecatch ②microCMS で選んだプリセット
// ③記事 ID から決まる既定プリセット（未設定でも壊れず、記事ごとに固定）
export function getArticleThumbnail(
  article: Pick<ArticleProps, "id" | "eyecatch" | "thumbnailPreset">
): EyecatchProps {
  if (article.eyecatch?.url) {
    return article.eyecatch;
  }
  const preset =
    normalizePreset(article.thumbnailPreset) ?? presetByArticleId(article.id);
  return { url: `/thumbnails/${preset}.png`, ...PRESET_SIZE };
}

// microCMS のセレクトフィールドは string[] で返る（単数選択でも配列）。
// 未知の値・未設定は undefined
function normalizePreset(
  value: string | string[] | undefined
): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return (THUMBNAIL_PRESETS as readonly string[]).includes(first ?? "")
    ? first
    : undefined;
}

// 記事 ID のハッシュでプリセットを決める（同じ記事は常に同じ画像になる）
function presetByArticleId(id: string): string {
  let hash = 0;
  for (const ch of id) {
    hash = (hash + ch.charCodeAt(0)) % THUMBNAIL_PRESETS.length;
  }
  return THUMBNAIL_PRESETS[hash];
}
