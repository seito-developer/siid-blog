// CTA リンクへの UTM パラメータ付与（Issue #57 / #61）。
// 設計ルールは docs/ANALYTICS.md を参照。
// utm_source / utm_medium はブログ CTA で固定、campaign は記事 slug、
// content は CTA の設置位置と種別を表す。

export const UTM_SOURCE = "blog";
export const UTM_MEDIUM = "cta";

export function withUtm(
  url: string,
  { campaign, content }: { campaign: string; content: string }
): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", UTM_SOURCE);
  u.searchParams.set("utm_medium", UTM_MEDIUM);
  u.searchParams.set("utm_campaign", campaign);
  u.searchParams.set("utm_content", content);
  return u.toString();
}
