# 計測基盤ガイド（GA4 / UTM / Search Console）

Issue #61 で整備した計測ルールのドキュメント。CTA を追加・変更する際は必ず本書のルールに従うこと。

## 1. UTM 設計ルール

ブログから外部サイト（SiiD サービスサイト・LINE 等）への CTA リンクには、以下の UTM パラメータを付与する。付与は `web/src/libs/utm.ts` の `withUtm()` を必ず使う（手書き禁止）。

| パラメータ | 値 | 説明 |
|---|---|---|
| `utm_source` | `blog` | 固定。SiiD BLOG 発であることを示す |
| `utm_medium` | `cta` | 固定。CTA 経由の流入 |
| `utm_campaign` | 記事の slug（例: `abc123`） | どの記事から流入したか |
| `utm_content` | `<位置>_<CTA種別>`（例: `article_bottom_counseling`） | どの位置のどの CTA か |

### 位置（position）の語彙

| 値 | 場所 |
|---|---|
| `article_bottom` | 記事末の統合 CTA カード |

今後 CTA を増やす場合（ヘッダー常設・本文途中・追従バー等）は、`header` / `article_middle` / `sticky_bar` のように追加し本表を更新する。

### CTA 種別（type）の語彙

`counseling`（無料個別面談）/ `document`（資料請求）/ `line`（公式LINE）/ `youtube_seito` / `youtube_siid` / `x`

## 2. GA4 カスタムイベント設計

CTA クリック時に `web/src/components/cta-link.tsx` がイベントを送信する。

- **イベント名**: `cta_click`
- **パラメータ**:
  - `cta_type` — CTA 種別（上記の語彙）
  - `cta_position` — CTA 位置（上記の語彙）
  - `article_slug` — 記事の slug
  - `link_url` — 遷移先 URL（UTM 付き）

### GA4 管理画面での設定（オーナー作業）

1. GA4 の「管理 > カスタム定義 > カスタムディメンション」で以下を登録すると、探索レポートで内訳を見られる:
   - `cta_type`（イベントスコープ）
   - `cta_position`（イベントスコープ)
   - `article_slug`（イベントスコープ）
2. 必要に応じて「管理 > イベント」で `cta_click` をキーイベント（コンバージョン）に指定する。

動作確認は GA4 の「管理 > DebugView」または リアルタイムレポートで、CTA クリック後に `cta_click` イベントが届くことを確認する。

## 3. Google Search Console の導入（オーナー作業）

1. https://search.google.com/search-console にアクセスし、Google アカウントでログイン
2. プロパティを追加:
   - 推奨: **URL プレフィックス**方式で `https://blog.bug-fix.org/` を登録（ドメイン方式は bug-fix.org 全体の DNS 所有権確認が必要）
3. 所有権の確認:
   - URL プレフィックス方式なら「HTML タグ」を選び、表示された `<meta name="google-site-verification" content="...">` の content 値を開発者に共有 → `web/src/app/layout.tsx` の metadata（`verification.google`）に追加してデプロイ
   - もしくは Google Analytics（GA4 導入済み）による確認でも可
4. 確認完了後、「サイトマップ」メニューで `https://blog.bug-fix.org/sitemap.xml` を送信
5. 数日後から「検索パフォーマンス」で表示回数・CTR・掲載順位が見られる。リライト優先度付けに活用する
