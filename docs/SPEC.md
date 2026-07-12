# SiiD BLOG 仕様書

最終更新: 2026-07-08

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| サイト名 | SiiD BLOG |
| 公開URL | https://blog.bug-fix.org/ |
| 目的 | AIプログラミングスクール SiiD のブログメディア。エンジニア転職・技術学習の情報発信を通じ、SEO 流入とスクール受講へのコンバージョンを狙う |
| 運営 | SiiD（セイト先生 / YouTube登録者数12万人） |
| ホスティング | Vercel |
| CMS | microCMS（サービスドメイン: `siid-web`） |
| アクセス解析 | Google Analytics (gtag.js) |

### 経緯

元は WordPress で運用していたブログを microCMS + Next.js に移行したもの。移行作業は完了済みで、リポジトリ内の `others/`（移行スクリプト）と `article-transferring/`（マッピング・変換データ）はその遺物。今後の開発対象は `web/` のみ。

## 2. 技術スタック

- Next.js 15.4 (App Router, Turbopack dev)
- React 19 / TypeScript 5
- Tailwind CSS 4（+ tailwindcss-animate / tw-animate-css）
- shadcn/ui 系コンポーネント（Radix UI, class-variance-authority, `web/components.json`）
- microcms-js-sdk 3.x
- sanitize-html（記事本文の XSS 対策）
- jsdom（メタデータ生成時の HTML→テキスト変換、サーバーサイドのみ）
- dayjs, lucide-react

## 3. ディレクトリ構成

```
siid-blog/
├── web/                      # Next.js アプリ本体（開発対象）
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # 記事一覧（トップ）
│   │   │   ├── layout.tsx            # 共通レイアウト・サイト全体メタデータ・GA
│   │   │   ├── not-found.tsx         # 404
│   │   │   ├── constants.ts          # API定数・ページサイズ
│   │   │   └── blog/[slug]/          # 記事詳細
│   │   │       ├── page.tsx          #   本体 + generateStaticParams + generateMetadata
│   │   │       ├── getBlogPost.ts    #   記事取得（fetch + リトライ）
│   │   │       └── defaultAuthor.ts  #   著者フォールバック
│   │   ├── components/
│   │   │   ├── article-body/         # 記事本文表示（sanitize / header / footer / css）
│   │   │   ├── ui/                   # shadcn/ui 系（badge, button, card, pagination）
│   │   │   └── *.tsx                 # 一覧・検索・パンくず・バナー・GA 等
│   │   ├── hooks/usePages.ts         # ページネーション用フック
│   │   ├── interfaces/common.ts      # 型定義（データモデル）
│   │   └── libs/microcms.ts          # microCMS SDK クライアント
│   └── package.json
├── others/                   # 【遺物】WordPress→microCMS 移行ツール（Node.js）
├── article-transferring/     # 【遺物】移行時のマッピング・変換データ
├── MEMO.md                   # オーナーの改善メモ（今後の展望のソース）
└── docs/SPEC.md              # 本書
```

## 4. データモデル（microCMS）

API は **`blog` エンドポイント1つのみ**。著者・カテゴリ・タグは別 API ではなく、blog 記事のフィールドとして保持する。

型定義: `web/src/interfaces/common.ts`

### ArticleContentProps（記事）

| フィールド | 型 | 備考 |
|---|---|---|
| id | string | microCMS コンテンツID。URL の slug として使用 |
| title | string | 記事タイトル |
| contents | string | 本文（リッチエディタの HTML） |
| excerpt | string | 抜粋 |
| author | AuthorProps \| null | null の場合は「AI講師 シンディ」にフォールバック |
| categories | CategoryProps[] | 現状は配列。**今後1記事1カテゴリに変更予定** |
| tags | - | **廃止済み**（フロントでは非表示・型からも削除。microCMS スキーマからのフィールド削除は管理画面作業） |
| eyecatch | { url, width, height } | アイキャッチ画像（microcms-assets.io 配信） |
| readTime | string | 読了時間 |
| publishedAt / createdAt / updatedAt | string | 日時 |
| slug | string | フィールドとして存在するが、ルーティングには id を使用 |

## 5. 画面仕様

### 5.1 記事一覧（トップ） `/`

- ファイル: `web/src/app/page.tsx`（動的レンダリング）
- クエリパラメータ:
  - `page` — ページ番号（1始まり）。`(page - 1) × perPage` を offset に変換
  - `perPage` — 1ページ件数（デフォルト 10 = `POSTS_NUM_PER_PAGE`）
  - `q` — 検索キーワード。microCMS の全文検索 `q` パラメータにそのまま渡す
- 並び順: `publishedAt` 降順
- 構成: ヒーロー見出し → 検索バー →（検索時: 件数表示）→ 記事カード一覧（`article-list.tsx` / `article.tsx`）→ オフセットページネーション
- 検索バー（`search-bar.tsx`）は client component。送信で `/?q=...` に遷移
- ページネーション（`article-manager.tsx` + `usePages.ts`）は client component。クリックで `?page=N` に遷移（スクロール位置維持）

### 5.2 記事詳細 `/blog/[slug]`

- ファイル: `web/src/app/blog/[slug]/page.tsx`
- slug = microCMS のコンテンツ ID。`generateStaticParams` で全記事分を静的生成（新規記事は on-demand で生成される）
- 構成: パンくず（`breadcrumbs.tsx`）→ 記事ヘッダー（アイキャッチ・著者・カテゴリ・日付・タイトル）→ 本文（`article-body`）→ SiiD 受講バナー（`banner-siid.tsx`）
- 本文は microCMS のリッチエディタ HTML を `sanitize-article-html.tsx`（sanitize-html）でサニタイズして描画。表示スタイルは `article-body.css`
- メタデータ（`generateMetadata`）: 本文 HTML をテキスト化し先頭120文字を description に。canonical / OGP（article 型・アイキャッチ画像）を出力

### 5.3 カテゴリ別記事一覧 `/category/[slug]`

- ファイル: `web/src/app/category/[slug]/page.tsx`（動的レンダリング）
- URL はカテゴリ名ベースのスラッグ（例: `/category/programming`）。slug ↔ microCMS カテゴリ ID の対応表は `web/src/app/category/categories.ts` でコード管理（**カテゴリを追加・変更したらここに追記する**。整合性はユニットテストで担保）
- microCMS の `filters: categories[contains]<id>` でカテゴリ別に取得。`?page=` によるページネーションはトップと共通（`ArticleManager`）
- 未知のスラッグ・記事0件のカテゴリは 404
- 記事詳細のパンくずから先頭カテゴリへリンク（対応表に無いカテゴリはリンクなし）

### 5.4 共通

- レイアウト: `layout.tsx`（サイト全体のメタデータ・OGP・GA スクリプト・フッター。`metadataBase` = `SITE_URL`）
- 404: `not-found.tsx`
- SEO:
  - `app/sitemap.ts` — 全記事 + 記事のあるカテゴリ + トップを列挙（1日1回再生成）
  - `app/robots.ts` — 全許可。検索・ページ送りのパラメータ付き URL は disallow
  - JSON-LD（`components/json-ld.tsx`）— 記事: Article + BreadcrumbList / カテゴリ: BreadcrumbList / トップ: WebSite
  - canonical はトップ・記事・カテゴリ各ページで出力。サイト URL は `constants.ts` の `SITE_URL` で一元管理
- テーマ: メインカラー `#214a4a`（深緑）、背景 `#F4F4F4`、本文フォント Noto Sans JP（トップ）/ Geist（レイアウト変数）

## 6. データ取得と キャッシュ戦略

| 対象 | 方式 |
|---|---|
| 記事一覧 | microcms-js-sdk (`client.get`) でリクエスト時取得（searchParams 依存の動的ページ） |
| 記事詳細 | 素の `fetch` に `X-MICROCMS-API-KEY` ヘッダー。`next: { tags: ["blog-<slug>"] }` でタグ付けし ISR キャッシュに載せる。429 (rate limit) 時は 1 秒待って SDK で再試行（`getBlogPost.ts`） |

**再検証（オンデマンド ISR）**: `web/src/app/api/revalidate/route.ts` が microCMS Webhook の受け口。記事の公開・更新・削除時に microCMS から POST が飛び、`X-MICROCMS-Signature`（HMAC-SHA256）をシークレット `MICROCMS_WEBHOOK_SECRET` で検証した上で `revalidateTag("blog-<id>")` を呼ぶ。これにより既存記事の更新が再デプロイなしで静的ページに反映される。記事一覧は searchParams を await する動的レンダリングのためリクエスト毎に最新を取得し、再検証は不要（一覧を静的化・キャッシュする変更を入れる場合は一覧側の再検証も併せて設計すること）。

microCMS 側の設定: 管理画面 > blog API > API 設定 > Webhook で「カスタム通知」を追加し、URL に `https://blog.bug-fix.org/api/revalidate`、シークレットに `MICROCMS_WEBHOOK_SECRET` と同じ値を設定する（コンテンツの公開・更新・削除時に通知）。

**下書きプレビュー（画面プレビュー）**: microCMS の記事編集画面「Page Preview」から `web/src/app/api/preview/route.ts` に遷移する。draftKey を microCMS への問い合わせで検証してから Next.js の Draft Mode を有効化し、draftKey を httpOnly Cookie に保持して記事ページへリダイレクト。記事ページは Draft Mode 中のみ draftKey 付きで下書きを取得する（`cache: no-store`、公開キャッシュには載せない）。プレビュー中はページ上部にバナーを表示し、`/api/exit-preview` で終了できる。

microCMS 側の設定: 管理画面 > blog API > API 設定 > 画面プレビュー に `https://blog.bug-fix.org/api/preview?slug={CONTENT_ID}&draftKey={DRAFT_KEY}` を設定する。

## 7. 運用フロー

### 記事の公開・更新

microCMS 管理画面（https://siid-web.microcms.io）から手動で行う。コード変更・デプロイ操作は不要（既存記事の更新は Webhook 経由の再検証で反映される。§6 参照）。

### コードの変更

1. develop から作業ブランチを切り、PR を develop にマージ
2. リリース時にオーナーが develop → main をマージ
3. Vercel が main を自動デプロイ

詳細は `docs/WORKFLOW.md`（ブランチ戦略・PR ルール）を参照。

### 環境変数

| 変数 | 用途 |
|---|---|
| `NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン（`siid-web`） |
| `MICROCMS_API_KEY` | microCMS API キー（サーバー専用。`NEXT_PUBLIC_` を付けるとクライアントに露出し得るため付けない） |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 測定 ID |
| `MICROCMS_WEBHOOK_SECRET` | microCMS Webhook の署名検証用シークレット（サーバー専用。`/api/revalidate` で使用） |

- 本番: Vercel のプロジェクト設定に登録済み
- ローカル: `web/.env.local` に設定する（gitignore 済み。手元に無い場合は Vercel の設定値から作成）

## 8. 既知の課題・改善候補

1. **テストが無い** — 現状は lint + build + 目視のみ。今後 Vitest 等を導入したい意向あり
2. **パンくずのカテゴリリンクがコメントアウト** — カテゴリページ自体が未実装（`blog/[slug]/page.tsx`）
3. **`html lang="en"`** — 日本語サイトだが `layout.tsx` の lang 属性が `en` のまま
4. **ファイル名 typo** — `bannaer-siid.tsx`（banner の誤り）

## 9. 今後の展望（MEMO.md より）

### 目的

現状は「とりあえず作った」段階で、SEO やスクール（SiiD）受講へのコンバージョンを考慮した設計になっていない。また記事の更新・運用がしやすい状態でもない。これらを解消する。

### セットアップ系

- GitHub の運用フローの確立（ブランチ戦略・PR ルール）
- 必要なスキルや MCP の設定
- SEO を考慮したマークアップ改善

### 記事更新の省力化

- ~~**タグの廃止**~~ — フロントエンド側は対応済み（#11。表示・型から削除。microCMS スキーマの tags フィールド削除は管理画面作業として残）
- **カテゴリは1記事1つのみ** — 現状の複数カテゴリ配列を単一に変更
- **サムネイルのプリセット化** — あらかじめ用意した画像アイコンから選ぶ方式にする（zenn.dev のような仕様）

> タグ・カテゴリ・サムネイル周りに手を入れる際は、この方針との整合を必ず確認すること。
