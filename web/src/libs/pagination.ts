// ページ送りの共通ユーティリティ。
// 一覧系ページ（/ の検索・/articles・/category/[slug]）で共有する。

// page パラメータを 1 以上の整数に正規化する
// （0・負数・数値以外・未指定はすべて 1 扱い）
export function normalizePage(page: string | undefined): number {
  const parsed = parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

// 1ページの件数を 1 以上の整数に正規化する（不正値は既定値）
export function normalizePerPage(
  perPage: string | undefined,
  fallback: number
): number {
  const parsed = parseInt(perPage ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

// 1始まりのページ番号を microCMS の offset に変換する
export function pageToOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// 一覧ページの URL（canonical 用）。1ページ目はパラメータ無し、2ページ目以降は ?page=N を付ける。
// Google はページ送りの各ページに固有の URL と自己参照の canonical を推奨している
export function pagedUrl(baseUrl: string, page: number): string {
  return page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
}

// 一覧ページのタイトル。2ページ目以降はページ番号を付けてタイトルの重複を避ける
export function pagedTitle(title: string, page: number): string {
  return page > 1 ? `${title}（${page}ページ目）` : title;
}
