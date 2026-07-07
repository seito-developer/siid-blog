# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

AIプログラミングスクール SiiD のブログメディア「SiiD BLOG」。https://blog.bug-fix.org/ で公開済み。
Next.js 15 (App Router) + microCMS (ヘッドレスCMS) + Vercel の Jamstack 構成。

詳細仕様（画面構成・データモデル・運用フロー・今後の展望）は `docs/SPEC.md` を参照すること。

## ディレクトリ構成

- `web/` — **開発対象はここのみ**。Next.js アプリ本体
- `others/`, `article-transferring/` — WordPress→microCMS 移行ツールとデータ。**移行完了済みの遺物であり、今後触らない**
- `MEMO.md` — オーナーが書く今後の改善メモ（機能追加の際は参照する）

## コマンド

すべて `web/` ディレクトリで実行する:

```sh
cd web
npm install       # 依存インストール
npm run dev       # 開発サーバー起動 (Turbopack, http://localhost:3000)
npm run build     # 本番ビルド（変更後は必ずビルドが通ることを確認する）
npm run lint      # ESLint
```

テストは現状存在しない（今後 Vitest 等の導入を検討中）。品質担保は `lint` + `build` + 目視確認。

### 環境変数

ローカル実行には `web/.env.local` が必要（gitignore 済みのためリポジトリには無い。無ければユーザーに値を確認して作成する）:

- `NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN` — microCMS サービスドメイン（`siid-web`）
- `NEXT_PUBLIC_MICROCMS_API_KEY` — microCMS API キー
- `NEXT_PUBLIC_GA_ID` — Google Analytics 測定 ID
- `MICROCMS_WEBHOOK_SECRET` — microCMS Webhook の署名検証用シークレット（サーバー専用。`/api/revalidate` で使用。ローカル開発では未設定でも可）

## アーキテクチャ

- **技術**: Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / microcms-js-sdk / sanitize-html
- **CMS**: microCMS の API は `blog` エンドポイント1つのみ。著者・カテゴリ・タグは blog 記事のフィールドとして保持（`web/src/interfaces/common.ts` の `ArticleContentProps` が全体像）
- **記事一覧** (`web/src/app/page.tsx`): searchParams（`page` / `perPage` / `q`）による動的レンダリング。検索は microCMS の全文検索 `q` パラメータをそのまま利用。1ページ10件（`web/src/app/constants.ts`）
- **記事詳細** (`web/src/app/blog/[slug]/page.tsx`): `generateStaticParams` で全記事IDを静的生成。slug = microCMS のコンテンツID。取得は `getBlogPost.ts`（SDK ではなく素の fetch + `next.tags: ["blog-<slug>"]`、429 時は SDK でリトライ）
- **記事本文**: microCMS のリッチエディタ HTML を `sanitize-article-html.tsx` でサニタイズして表示。本文スタイルは `article-body.css`。**本文レンダリングを変更する際は必ずサニタイズを通すこと**（過去に XSS 対応の hotfix 実績あり）
- **著者フォールバック**: 記事に author が無い場合は `defaultAuthor.ts`（AI講師 シンディ）を使用
- **UI コンポーネント**: `web/src/components/ui/` は shadcn/ui スタイル（components.json あり）。テーマカラーは `#214a4a`（深緑）、背景 `#F4F4F4`

## デプロイ・運用

- **記事の公開・更新**: microCMS 管理画面から手動（コード変更不要）
- **コード変更の反映**: 作業ブランチ → develop に PR、リリース時にオーナーが develop → main をマージすると Vercel が自動デプロイ（フロー詳細は `docs/WORKFLOW.md`）
- **記事更新の反映**: microCMS の Webhook が `web/src/app/api/revalidate/route.ts` に POST し、`revalidateTag("blog-<id>")` で該当記事の静的ページを再検証する（署名検証に `MICROCMS_WEBHOOK_SECRET` を使用。`docs/SPEC.md` §6 参照）

## 既知の課題（変更時に留意）

- microCMS API キーが `NEXT_PUBLIC_` 接頭辞でクライアントに露出し得る（キーの権限は未確認）。サーバー専用化が改善候補
- タグ機能は今後**廃止予定**、カテゴリは**1記事1つ**に変更予定（MEMO.md）。タグ・カテゴリ周りの新規実装は事前にオーナーへ確認する
