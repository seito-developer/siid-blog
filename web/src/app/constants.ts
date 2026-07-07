export const BLOG_API_BASE = 'https://siid-web.microcms.io/api/v1';
export const BLOG_API_ENDPOINT = 'blog';
export const POSTS_NUM_PER_PAGE = 10;

// 記事詳細の ISR キャッシュタグ。getBlogPost での付与と
// /api/revalidate での再検証で同じ形式を共有する
export const blogCacheTag = (contentId: string) => `blog-${contentId}`;