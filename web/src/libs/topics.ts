import { ArticleProps } from "@/interfaces/common";

// テーマ別まとめページ（/topics/<slug>）の定義。
// 検索流入の多い技術テーマごとに、タイトルにキーワードを含む記事を自動で集める。
// カテゴリ（プログラミング等）より細かい入口を作り、古い技術記事へのリンク経路を増やす
// （SEO コンサルタントの提案）。テーマを追加するときはここに追記する。

export type Topic = {
  slug: string; // URL 用スラッグ（英小文字・ハイフン）
  name: string; // 表示名
  description: string; // ページ冒頭の導入文・meta description
  pattern: RegExp; // 記事タイトルに対するマッチ条件
};

export const TOPICS: Topic[] = [
  {
    slug: "pandas",
    name: "pandas",
    description:
      "Pythonのデータ分析ライブラリ「pandas」の記事まとめです。行・列の抽出や削除、フィルタリング、ソート、groupby、欠損値の処理まで、データ操作の基本を目的別に解説しています。",
    pattern: /pandas/i,
  },
  {
    slug: "matplotlib-seaborn",
    name: "matplotlib・Seaborn",
    description:
      "Pythonのグラフ描画ライブラリ「matplotlib」と「Seaborn」の記事まとめです。散布図・棒グラフ・箱ひげ図・ヒートマップなどの作り方から、目盛の設定、日本語の文字化け対策、画像保存まで解説しています。",
    pattern: /matplotlib|seaborn/i,
  },
  {
    slug: "excel",
    name: "openpyxl・Excel・VBA",
    description:
      "PythonのopenpyxlやVBAでExcelを操作する記事のまとめです。インストール方法から、ファイルの読み書き、条件付き書式やグラフの作成、業務の自動化まで解説しています。",
    pattern: /openpyxl|excel|エクセル|vba/i,
  },
  {
    slug: "laravel",
    name: "Laravel",
    description:
      "PHPフレームワーク「Laravel」の記事まとめです。Laravel Sailでの環境構築、よくあるエラーの対処法、VS Codeの拡張機能、デプロイまで、開発に役立つ情報を解説しています。",
    pattern: /laravel/i,
  },
  {
    slug: "javascript",
    name: "JavaScript",
    description:
      "JavaScriptの記事まとめです。配列やmap・find、アロー関数などの基本文法から、alert・confirm・promptなどのダイアログ、Puppeteerを使ったスクレイピングまで解説しています。",
    pattern: /javascript|typescript|puppeteer|node\.js/i,
  },
];

export function findTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}

// テーマに当てはまる記事を新しい順に返す（純関数。テスト対象）
export function filterTopicArticles<T extends Pick<ArticleProps, "title" | "publishedAt">>(
  topic: Topic,
  articles: T[]
): T[] {
  return articles
    .filter((article) => topic.pattern.test(article.title))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
