// 注目記事の手動指定リスト（Issue #64）。
// microCMS のコンテンツ ID を並べる。先頭が大カード、続く2件が小カードになる。
// 空の場合や取得0件の場合は最新記事にフォールバックする。
// TODO(owner): 注目させたい記事の microCMS コンテンツ ID をここに設定する
//   （管理画面の記事 URL 末尾の ID / API の contents[].id）。
export const FEATURED_ARTICLE_IDS: string[] = [
    "12", "7", "8"
];

// 表示件数（大カード1 + 小カード2）
export const FEATURED_ARTICLES_LIMIT = 3;
