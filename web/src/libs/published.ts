// 公開済み判定（Issue #101）
//
// microCMS は「下書きの取得」が有効な API キーで取得すると、未公開の下書きも
// 通常の GET レスポンスに混ざって返す。その場合 publishedAt が無い（null / undefined）。
// サイト側のキー設定を誤っただけで下書きが公開ページや sitemap.xml に露出しないよう、
// 公開ページの生成側では publishedAt の有無で必ず絞り込む。
//
// 下書きプレビュー（Draft Mode + draftKey）は意図的に下書きを表示するため、
// この判定を使わない。
//
// 既知の限界: 一度公開した記事を「下書きに戻す」と publishedAt は消えずに残る
// （microCMS 仕様: https://document.microcms.io/manual/automatic-grant-fields
// 「公開中 → 下書き中（下書きに戻す）: 公開日時は更新されない」）。
// コンテンツ API はステータスを返さないため、この場合は判別できない。
// 本来の防御はサイト用キーの「下書きの取得」をオフにしておくこと（docs/SPEC.md §8）で、
// この判定は「一度も公開されていない下書き」（#101 で実際に露出したケース）を止める二重の備え。

export type PublishedLike = {
  publishedAt?: string | null;
};

// 公開済みなら true。publishedAt が空文字・null・undefined なら未公開（下書き）
export function isPublished(item: PublishedLike): boolean {
  return typeof item.publishedAt === "string" && item.publishedAt.length > 0;
}

// 公開済みのものだけを残す
export function filterPublished<T extends PublishedLike>(items: T[]): T[] {
  return items.filter(isPublished);
}
