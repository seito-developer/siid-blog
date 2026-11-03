export const SITE_URL = 'https://blog.bug-fix.org';
export const SITE_NAME = 'SiiD BLOG';
export const BLOG_API_BASE = 'https://siid-web.microcms.io/api/v1';
export const BLOG_API_ENDPOINT = 'blog';
// 一覧（新着・カテゴリ・検索）の1ページの件数。
// 10件だと古い記事がトップから10クリック以上奥になり Google にクロールされにくいため、
// どの記事も数クリックで届くよう多めにしている（SEO コンサルタントの指摘）
export const POSTS_NUM_PER_PAGE = 50;

// TOP の「新着記事」セクションの表示件数（Issue #94）。
// TOP ではページネーションを出さず、「もっと見る」で /articles へ送る
export const TOP_LATEST_POSTS_NUM = 6;

// サイト共通の OGP 画像（1200x630）。専用画像を用意したらここを差し替える
export const DEFAULT_OGP_IMAGE = '/thumbnails/tech.png';

// 記事詳細の ISR キャッシュタグ。getBlogPost での付与と
// /api/revalidate での再検証で同じ形式を共有する
export const blogCacheTag = (contentId: string) => `blog-${contentId}`;