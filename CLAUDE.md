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
npm run typecheck # TypeScript 型チェック (tsc --noEmit)
npm test          # ユニットテスト (Vitest)
```

テストは Vitest（`web/vitest.config.ts`、`src/**/*.test.ts`）。PR ごとに GitHub Actions（`.github/workflows/ci.yml`）で lint / typecheck / test が自動実行される。build はシークレットが必要なため Vercel 側で担保。

### 環境変数

ローカル実行には `web/.env.local` が必要（gitignore 済みのためリポジトリには無い）。`web/.env.example` をコピーして作る:

```sh
cp web/.env.example web/.env.local
```

- `NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN` — microCMS サービスドメイン（`siid-web`）
- `MICROCMS_API_KEY` — microCMS API キー（サーバー専用。`NEXT_PUBLIC_` を付けないこと）
- `NEXT_PUBLIC_GA_ID` — Google Analytics 測定 ID
- `MICROCMS_WEBHOOK_SECRET` — microCMS Webhook の署名検証用シークレット（サーバー専用。`/api/revalidate` で使用。ローカル開発では未設定でも可）

値が無い場合はオーナーに確認する。**推測で別のキーを入れないこと**（下記のとおり事故になる）。

#### microCMS の API キーは2系統ある（重要）

| | サイト用 | 入稿用 |
|---|---|---|
| 使う場所 | このサイト（`web/.env.local` と Vercel の `MICROCMS_API_KEY`） | 記事入稿 AI（別リポジトリ）、`web/scripts/*.mjs` の手元実行 |
| GET | オン | オン |
| GET「下書きの取得」 | **オフ** | オン |
| 書き込み（POST/PUT/PATCH/DELETE） | オフ | オン |

- **入稿用キーをサイト側に設定してはいけない。** 未公開の下書き記事が公開ページと `sitemap.xml` に露出する（2026-09-07 に本番で発生。Issue #100 / #101）
- サイト側は GET のみで足りる。`web/src/` に microCMS への書き込み呼び出しは 1 件も無い
- **「下書きの取得」をオフにしてもプレビューは壊れない。** `web/src/app/api/preview/route.ts` は記事ごとの `draftKey` を付けて取得するため、キー側に下書き権限が無くても該当記事だけは読める（2026-09-07 に本番で疎通確認済み）
- キーは共用せず用途ごとに発行する。共用すると片方の都合で再発行したときにもう片方が落ちる（2026-09-07 の障害の原因）
- `web/scripts/*.mjs` は書き込みを行うため入稿用キーが要る。これらは `process.env.MICROCMS_API_KEY` を優先し無ければ `web/.env.local` を読むので、`.env.local` はサイト用キーのまま、実行時に `MICROCMS_API_KEY=<入稿用キー> node scripts/xxx.mjs` と上書きする

## アーキテクチャ

- **技術**: Next.js 15 / React 19 / TypeScript / Tailwind CSS 4 / microcms-js-sdk / sanitize-html
- **CMS**: microCMS の API は `blog` エンドポイント1つのみ。著者・カテゴリ・タグは blog 記事のフィールドとして保持（`web/src/interfaces/common.ts` の `ArticleContentProps` が全体像）
- **記事一覧** (`web/src/app/page.tsx`): searchParams（`page` / `perPage` / `q`）による動的レンダリング。検索は microCMS の全文検索 `q` パラメータをそのまま利用。1ページ10件（`web/src/app/constants.ts`）
- **記事詳細** (`web/src/app/blog/[slug]/page.tsx`): `generateStaticParams` で全記事IDを静的生成。slug = microCMS のコンテンツID。取得は `getBlogPost.ts`（SDK ではなく素の fetch + `next.tags: ["blog-<slug>"]`、429 時は SDK でリトライ）
- **記事本文**: microCMS のリッチエディタ HTML を `sanitize-article-html.tsx` でサニタイズして表示。本文スタイルは `article-body.css`。**本文レンダリングを変更する際は必ずサニタイズを通すこと**（過去に XSS 対応の hotfix 実績あり）
- **著者フォールバック**: 記事に author が無い場合は `defaultAuthor.ts`（SiiD BLOG編集部）を使用
- **UI コンポーネント**: `web/src/components/ui/` は shadcn/ui スタイル（components.json あり）。テーマカラーは `globals.css` の `siid-*` トークン（main `#567EB4` / deep `#475499` / text `#342525` / bg `#F1F1F1` / CTA `#E0804C`）。色は hex 直書きせずトークンを使う

## 開発支援（スキル・MCP）

- **プロジェクトスキル**（`.claude/skills/`）:
  - `feature-work` — Issue 起点の標準開発フロー（ブランチ→実装→検証→PR→セルフレビュー）
  - `verify-web` — ローカル検証の標準手順（lint / typecheck / test / build / ブラウザ確認）
- **MCP サーバー**（`.mcp.json`）: microCMS 公式 `microcms-mcp-server`（コンテンツの参照・下書き操作）。API キーは環境変数 `MICROCMS_API_KEY` から渡す（`web/.env.local` と同じ値。シェルに export するか、未設定なら接続失敗するだけで他機能に影響なし）

## デプロイ・運用

- **記事の公開・更新**: microCMS 管理画面から手動（コード変更不要）
- **コード変更の反映**: 作業ブランチ → develop に PR、リリース時にオーナーが develop → main をマージすると Vercel が自動デプロイ（フロー詳細は `docs/WORKFLOW.md`）
- **記事更新の反映**: microCMS の Webhook が `web/src/app/api/revalidate/route.ts` に POST し、`revalidateTag("blog-<id>")` で該当記事の静的ページを再検証する（署名検証に `MICROCMS_WEBHOOK_SECRET` を使用。`docs/SPEC.md` §6 参照）

## 既知の課題（変更時に留意）

- タグ機能は**廃止済み**（フロント非表示・型削除済み。microCMS の tags フィールド削除は管理画面作業）。カテゴリは**1記事1つ**に変更予定（MEMO.md）。カテゴリ周りの新規実装は事前にオーナーへ確認する
