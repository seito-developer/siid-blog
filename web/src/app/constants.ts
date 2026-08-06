export const SITE_URL = 'https://blog.bug-fix.org';
export const SITE_NAME = 'SiiD BLOG';
export const BLOG_API_BASE = 'https://siid-web.microcms.io/api/v1';
export const BLOG_API_ENDPOINT = 'blog';
export const POSTS_NUM_PER_PAGE = 10;

// サイト共通の OGP 画像（1200x630）。専用画像を用意したらここを差し替える
export const DEFAULT_OGP_IMAGE = '/thumbnails/tech.png';

// 記事詳細の ISR キャッシュタグ。getBlogPost での付与と
// /api/revalidate での再検証で同じ形式を共有する
export const blogCacheTag = (contentId: string) => `blog-${contentId}`;