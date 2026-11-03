// 注目記事の手動指定リスト（Issue #64）。
// microCMS のコンテンツ ID を並べる。先頭が大カード、続く2件が小カードになる。
// 空の場合や取得0件の場合は最新記事にフォールバックする。
// 検索流入の多い記事と新しい AI 系記事を選んでいる（2026-11 時点の Search Console 実績）。
// 差し替える場合は管理画面の記事 URL 末尾の ID / API の contents[].id を指定する。
export const FEATURED_ARTICLE_IDS: string[] = [
    "orca-ade-guide", "laravel-vscode-extentions", "9b15fed64e"
];

// 表示件数（大カード1 + 小カード2）
export const FEATURED_ARTICLES_LIMIT = 3;
