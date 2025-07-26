# microCMS + next.js
https://blog.microcms.io/microcms-next15-jamstack-blog/
  
## 概要
このアプリは、WordPressからmicroCMSへの記事・カテゴリ・タグの移行と、Next.jsを用いたブログサイトの構築を目的としたプロジェクトです。
管理画面やAPI連携、記事表示、検索機能などを備えています。

## 使用技術
- Next.js
- React
- TypeScript
- Tailwind CSS
- microCMS  
- Node.js (移行ツール)
- その他: ESLint, PostCSS

## 主要なディレクトリ構成
- `web/` : Next.jsベースのフロントエンドアプリケーション。ブログ表示やUIコンポーネント、スタイル、設定ファイルなどを含む。
- `others/` : WordPressからmicroCMSへのデータ移行ツール。Node.jsで実- `article-transferring/` : 移行作業に関連するマッピングファイルや変換後データ(json/csv)を管理。

## 開発環境の立ち上げ方法
1. 依存パッケージのインストール
   ```sh
   cd web
   npm install
   ```
2. 開発サーバーの起動
   ```sh
   npm run dev
   ```
3. ブラウザで `http://localhost:3000` にアクセス

移行ツールの利用方法は `others/README.md` を参照してください。