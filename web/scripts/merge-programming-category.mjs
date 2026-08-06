// Issue #42: カテゴリ「Programming」(英語) を「プログラミング」(日本語) に統合する。
// 同一トピックが2カテゴリに分裂して評価分散の要因になっているため、
// 「Programming」が付いた記事のカテゴリを「プログラミング」に付け替える。
//
// 本番コンテンツを書き換えるため、オーナーが手元で実行する想定:
//
//   cd web
//   node scripts/merge-programming-category.mjs           # dry-run（対象の確認のみ）
//   node scripts/merge-programming-category.mjs --apply   # 実際に PATCH する
//
// MICROCMS_API_KEY は web/.env.local から自動読み込み（環境変数があれば優先）。
// 実行後、microCMS 管理画面でカテゴリマスタ「Programming」を削除すること
// （記事の参照が無くなるので削除可能になる）。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API_BASE = "https://siid-web.microcms.io/api/v1/blog";
const APPLY = process.argv.includes("--apply");

// 統合元: Programming（英語） → 統合先: プログラミング（日本語・新しい記事が使用）
const OLD_CATEGORY_ID = "ab2620f9b7";
const NEW_CATEGORY_ID = "b703z-gs1uw";

function loadApiKey() {
  if (process.env.MICROCMS_API_KEY) return process.env.MICROCMS_API_KEY;
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
  try {
    const match = readFileSync(envPath, "utf8").match(/^MICROCMS_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // .env.local が無い場合は環境変数必須
  }
  console.error("MICROCMS_API_KEY が見つかりません（環境変数か web/.env.local に設定してください）");
  process.exit(1);
}

const API_KEY = loadApiKey();

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`${options.method || "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  return res.json().catch(() => ({}));
}

async function listTargets() {
  const targets = [];
  let offset = 0;
  for (;;) {
    const data = await api(
      `?filters=categories[contains]${OLD_CATEGORY_ID}&fields=id,title,categories,category&limit=100&offset=${offset}`
    );
    targets.push(...data.contents);
    offset += 100;
    if (offset >= data.totalCount) return targets;
  }
}

async function run() {
  console.log(APPLY ? "=== APPLY モード（本番を書き換えます） ===" : "=== dry-run（--apply で実行） ===");

  const targets = await listTargets();
  console.log(`対象: ${targets.length} 記事（カテゴリ「Programming」が付いている記事）`);

  for (const post of targets) {
    // Programming → プログラミング に差し替え（他のカテゴリは維持・重複は除去）
    const ids = (post.categories || []).map((c) =>
      c.id === OLD_CATEGORY_ID ? NEW_CATEGORY_ID : c.id
    );
    const deduped = [...new Set(ids)];

    const payload = { categories: deduped };
    // 単一参照フィールドへ移行済みの場合（Issue #12）はそちらも付け替える
    if (post.category?.id === OLD_CATEGORY_ID) {
      payload.category = NEW_CATEGORY_ID;
    }

    console.log(
      `[${post.id}] ${(post.categories || []).map((c) => c.name).join(",")} -> ${deduped.join(",")} | ${post.title.slice(0, 40)}`
    );
    if (APPLY) {
      await api(`/${post.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      console.log(`[${post.id}] PATCH 完了`);
    }
  }

  if (APPLY) {
    const remaining = await api(`?filters=categories[contains]${OLD_CATEGORY_ID}&fields=id&limit=1`);
    console.log(`完了。残り ${remaining.totalCount} 記事（0 なら microCMS 管理画面で「Programming」カテゴリを削除できます）`);
  } else {
    console.log("dry-run 完了。問題なければ --apply を付けて実行してください。");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
