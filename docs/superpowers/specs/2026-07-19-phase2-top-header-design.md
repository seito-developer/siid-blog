# Phase 2: グローバルヘッダー + TOP 全面再構成 設計書

対象 Issue: #62（グローバルヘッダー）/ #63（ヒーローカルーセル+検索）/ #64（注目記事・インタビュー・カテゴリ導線）/ #65（YouTube・CTA帯・フッター強化）

作成日: 2026-07-19 / ブランチ: `feature/62-65-phase2-top`（1ブランチ・1PR）

## 1. 方針と前提

- 4 Issue はすべて Phase 2 の TOP 再構成で密結合。**1ブランチ・1PR**、コミットは Issue 単位で分割し各メッセージに `Closes #N`。
- **既存 Phase 1 基盤を最大限再利用する**:
  - UTM 付与: `web/src/libs/utm.ts` の `withUtm(url, {campaign, content})`（手書き禁止・`docs/ANALYTICS.md`）
  - CTA リンク + GA4 `cta_click` イベント: `web/src/components/cta-link.tsx`（`CtaLink`）
  - 外部リンク定数: `web/src/app/links.ts`（`SIID_SITE_URL` / `COUNSELING_URL` / `YOUTUBE_SEITO_URL`=`@webit7652` / `YOUTUBE_SIID_URL`=`@programming-siid` / `X_URL`）
  - カテゴリ対応表: `web/src/app/category/categories.ts`（`CATEGORIES` 4件: プログラミング/キャリア/マーケティング/コラム）
- テーマ: メイン `#214a4a`、アクセント `#289B8F`、背景 `#F4F4F4`。shadcn/ui・lucide-react・Noto Sans JP を踏襲。

### オーナー確認済みの決定事項
- CTA 遷移先: 確定 URL が揃うまで `bug-fix.org/siid` 系を暫定利用（UTM 付与）。
- 未確定データ（受講生インタビュー・給付金解説記事・キャンペーン枠・YouTube 登録者数）: **プレースホルダーで表示**。本番前差し替え項目は `TODO(owner):` コメント + PR 本文に列挙。
- 注目記事の抽出: **コード内の手動指定リスト**（`web/src/components/top/featured-articles.ts`）。

## 2. TOP（`web/src/app/page.tsx`）の構成

`page.tsx` を検索有無で分岐:

- **検索時（`?q=` あり）**: 現状どおり `SearchBar` + 検索結果 `ArticleManager`（回遊維持）。
- **通常時**: 以下を縦に構成
  1. `HeroCarousel`（#63）
  2. `SearchBar`（既存を直下に控えめ再配置）
  3. `FeaturedArticles`（#64）
  4. `Interviews`（#64・プレースホルダー）
  5. `CategoryNav`（#64）
  6. 新着記事セクション（既存 `ArticleManager` を「新着記事」見出しで維持）
  7. `YouTubeSection`（#65）
  8. `CtaBand`（#65）

`GlobalHeader`（#62）と強化 `Footer`（#65）は `layout.tsx` で全ページ共通。

## 3. コンポーネント設計

TOP 専用コンポーネントは `web/src/components/top/` に集約する。

### #62 GlobalHeader — `web/src/components/global-header.tsx`（client）
- sticky・白背景・下ボーダー・`z-50`。
- ロゴ「SiiD BLOG」→ `/`（**h1 にしない** プレーン `Link`）。
- カテゴリ 4 リンク（`CATEGORIES` → `/category/<slug>`）。
- 検索アイコン: クリックでヘッダー内インライン検索入力をトグル（`router.push('/?q=...')`）。
- CTA「無料で相談する」: `CtaLink`（`COUNSELING_URL`, `ctaType="counseling"`, `ctaPosition="header"`, `articleSlug="top"`）。
- **SP**: ロゴ + CTA(小) + ハンバーガー → ドロワー。要件: ナビ縦積み・フォーカストラップ・Esc 閉じ・`aria-label`・背景スクロールロック・オーバーレイクリックで閉じる。
- `layout.tsx` の `<body>` 直下（`children` の前）に配置。h1 重複が無いことを確認（ロゴは h1 にしない）。

### #63 HeroCarousel — `web/src/components/top/hero-carousel.tsx`（client）+ `hero-slides.ts`（設定）
- スライド設定は `hero-slides.ts` にコード管理（`{ id, title, description, imageSrc, href, ctaType, enabled }`）。
  - ① サービスサイト導線バナー（`SIID_SITE_URL`, UTM）。画像は当面 `banner-1.png` + テキスト。
  - ② 給付金（Reスキル認定講座）解説 — **プレースホルダー**（暫定リンク `SIID_SITE_URL`、`TODO(owner)`）。
  - ③ キャンペーン枠 — `enabled: false` で既定非表示（設定時のみ表示）。
- UI: 矢印・ドット。自動再生は任意実装だが **`prefers-reduced-motion` で無効化**。SP スワイプ対応（タッチイベント）。
- 外部リンクは `CtaLink`（`ctaPosition="hero"`）で UTM + GA4。

### #64 セクション群（`web/src/components/top/`）
- `featured-articles.tsx`（server）+ `featured-articles.ts`（ID リスト）: 手動指定 ID を microCMS から取得（`filters: id[equals]...[or]...`、失敗時 `[]`）。大カード1 + 小カード2。SP は 1 枚 + 「もっと見る」。ID リストが空/取得0件なら最新記事フォールバック（`orders: -publishedAt` 上位3）。
- `interviews.tsx`: **プレースホルダー**カード3枚（before→after 職種バッジ）。SP 横スクロール。データ構造 `INTERVIEWS` が空なら **セクション非表示**（`return null`）。プレースホルダーは既定で表示、`TODO(owner)`。
- `category-nav.tsx`: 4 カード（`CATEGORIES`）+ lucide-react アイコン。SP 2×2。`/category/<slug>` へ内部リンク。
- 記事カード見出しレベル: `article.tsx` に `headingLevel?: "h2" | "h3"`（既定 `h2`）を追加。TOP のセクション内カードは `h3`（セクション見出しが h2）。

### #65 YouTube / CTA帯 / Footer
- `youtube-section.tsx`: 2ch カード。セイト先生（`YOUTUBE_SEITO_URL`）+ SiiD（`YOUTUBE_SIID_URL`）。サムネ・登録者数は **プレースホルダー**（`TODO(owner)`）、URL は実値。「チャンネルを見る」は `CtaLink`（`ctaType="youtube"`, `ctaPosition="top_youtube"`）。
- `cta-band.tsx`: 深緑（`#214a4a`）背景・3 ボタン。無料個別面談（`COUNSELING_URL`, `counseling`）/ 資料請求（`DOCUMENT_URL` 暫定 = `SIID_SITE_URL`, `document`）/ 公式LINE（`LINE_URL` 暫定 = `SIID_SITE_URL`, `line`）。すべて `CtaLink`（`ctaPosition="cta_band"`）。
- `footer.tsx` 強化（既存を書き換え、layout 共通のため記事詳細にも自動適用）: カテゴリリンク / 注目記事 or 人気記事 / 運営者情報（SiiD公式・運営会社BugFix）/ SNS（YouTube×2・X）/ コピーライト。

### 共通の追加
- `web/src/app/links.ts` に `DOCUMENT_URL` / `LINE_URL` を追加（暫定で `SIID_SITE_URL`、`TODO(owner)` コメント）。
- `docs/ANALYTICS.md` の position 語彙に `header` / `hero` / `cta_band` / `top_youtube` / `footer`、type 語彙に `document` / `line` / `youtube` を追記。

## 4. データ取得・ガード
- `FeaturedArticles` の microCMS 取得は try/catch で `[]` フォールバック（ページ全体を落とさない）。
- 各セクションはデータ0件で `return null`（崩れず非表示）。
- 記事本文レンダリングには触れない（サニタイズ対象外の作業）。

## 5. テスト（Vitest）
- `hero-slides` の `enabled` フィルタ、`featured-articles` の ID クエリ生成、`utm`/`links` 追加分、`categories` 整合（既存）を対象にユニットテストを追加。
- UI コンポーネントは lint/typecheck/build + ローカルブラウザ確認（`verify-web`）で担保。

## 6. 本番前差し替え項目（PR 本文にも記載）
- 給付金解説記事の実 URL / スライド訴求（スライド②）
- 受講生インタビュー実データ（`interviews.tsx`）
- YouTube 登録者数・サムネイル
- 資料請求 / 公式LINE の正式 URL（`DOCUMENT_URL` / `LINE_URL`）
- キャンペーンスライド（`hero-slides.ts` の ③ を `enabled: true`）
- 注目記事 ID リスト（`featured-articles.ts`）
