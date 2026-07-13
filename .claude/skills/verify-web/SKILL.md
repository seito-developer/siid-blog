---
name: verify-web
description: SiiD BLOG のコード変更をローカルで検証する標準手順（lint / typecheck / test / build / ブラウザ確認）。実装後・コミット前・「動作確認して」と言われたときに使う。
---

# verify-web: ローカル検証フロー

すべて `web/` ディレクトリで実行する。

## 1. 静的検証（必須）

```bash
cd web
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest（src/**/*.test.ts）
```

## 2. 本番ビルド（コード変更時は必須）

```bash
npm run build
```

- `web/.env.local`（`MICROCMS_API_KEY` 等）が必要。無ければユーザーに確認
- 全記事の静的生成が完走すること（`✓ Generating static pages`）
- 記事詳細 `/blog/[slug]` が `● (SSG)` のままであること（動的に変わっていたらキャッシュ戦略を壊している）
- microCMS のレート制限（429）で失敗した場合は 1 分待って再実行

## 3. ブラウザ確認（UI 変更時は必須）

```bash
npm run dev   # http://localhost:3000
```

- **注意**: dev サーバー起動中に `.next` を削除したり `npm run build` を実行すると 500 になる。ビルド検証と並行しない
- 確認対象: トップ `/`、記事詳細 `/blog/security-4`、カテゴリ `/category/programming`
- UI 変更は SP（375px）と PC（1280px〜）の両方をスクリーンショットで確認し、ユーザーに見せる
- 記事本文の変更時は動画埋め込みのある記事（`/blog/claude-code-plugins`）も確認する

## 4. 機能別の追加確認

| 変更箇所 | 確認方法 |
|---|---|
| `/api/revalidate` | 署名付き curl（HMAC-SHA256、`MICROCMS_WEBHOOK_SECRET`） |
| `/api/preview` | `/api/preview?slug=<公開記事ID>&draftKey=dummy` → バナー表示 → 終了リンク。※dummy キーで通るのは**公開済み記事に限り** microCMS が不正 draftKey を無視して 200 を返すため（実測済みの仕様）。実際の下書き内容の確認は microCMS の「Page Preview」ボタン（本物の draftKey）でのみ可能 |
| sitemap / robots | `curl localhost:3000/sitemap.xml` / `robots.txt` |
| サニタイズ | `npm test`（sanitize-article-html.test.ts）+ 実記事の表示 |
