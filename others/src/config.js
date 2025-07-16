export const config = {
  api: true,
  xmlPath: "origin.xml", // 読み取るXMLファイル名（dataフォルダ直下に配置）
  postType: "post", // WordPressの移行対象の投稿タイプ
  draft: true, // 下書き投稿を移行するかどうか
  apiName: "blog", // microCMSのAPIのエンドポイント名
  apiSchema: {
    title: true, // テキストフィールド：タイトル（必須）
    contents: true, // リッチエディタ：本文コンテンツ
    author: true, // テキストフィールド：著者
    eyecatch: true, // 画像：アイキャッチ画像
    categories: true, // 複数コンテンツ参照：カテゴリを移行するかどうか
    tags: true // 複数コンテンツ参照：タグを移行するかどうか
  }, // microCMSのAPIのスキーマ設定
  category: {
    execute: true, // カテゴリ移行を実行するかどうか
    taxonomy: "category", // WordPressのカテゴリタクソノミー名（/wp-admin/edit-tags.php?taxonomy=XXXX）
    apiName: "categories", // microCMSのカテゴリ用APIのエンドポイント名
    apiSchema: {
      name: true, // テキストフィールド：カテゴリー名（必須）
      description: false // テキストエリア：カテゴリー説明を移行するかどうか
    } // microCMSのカテゴリ用APIのスキーマ設定
  },
  tag: {
    execute: true, // タグ移行を実行するかどうか
    taxonomy: "post_tag", // WordPressのタグタクソノミー名（/wp-admin/edit-tags.php?taxonomy=XXXX）
    apiName: "tags", // microCMSのタグ用APIのエンドポイント名
    apiSchema: {
      name: true, // テキストフィールド：タグ名（必須）
      description: false // テキストエリア：タグ説明を移行するかどうか
    } // microCMSのタグ用APIのスキーマ設定
  },
};
