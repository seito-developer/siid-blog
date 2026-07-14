// Issue #51: 旧カテゴリを新カテゴリ体系（プログラミング/キャリア/マーケティング/コラム）に統合する。
//
// やること:
//   1. カテゴリ「コラム」（contentId: column）を作成（既存なら何もしない）
//   2. 旧カテゴリが付いた記事を新カテゴリに付け替える
//        プログラミング ← JavaScript, Python, TypeScript, Docker, AWS, Flutter,
//                          Storybook, HTML, VBA, Spredsheets, GAS, Excel
//        キャリア       ← 転職
//        コラム         ← Uncategorized
//   3. 参照が無くなった旧カテゴリのコンテンツを削除する
//
// 本番コンテンツを書き換えるため、オーナーが手元で実行する想定:
//
//   cd web
//   node scripts/migrate-categories-issue51.mjs           # dry-run（対象の確認のみ）
//   node scripts/migrate-categories-issue51.mjs --apply   # 実際に反映する
//
// MICROCMS_API_KEY は web/.env.local から自動読み込み（環境変数があれば優先）。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API_BASE = "https://siid-web.microcms.io/api/v1";
const APPLY = process.argv.includes("--apply");

// 統合先カテゴリ
const PROGRAMMING_ID = "b703z-gs1uw"; // プログラミング
const CAREER_ID = "89b7505ad7"; // キャリア
const COLUMN_ID = "column"; // コラム（本スクリプトで作成）

// 統合元（旧カテゴリ）ID → 統合先 ID
const MAPPING = {
  eda71746c0: PROGRAMMING_ID, // JavaScript
  "11a4a60b51": PROGRAMMING_ID, // Python
  "969545dde1": PROGRAMMING_ID, // TypeScript
  d548c5b83f: PROGRAMMING_ID, // Docker
  "7d1507284a": PROGRAMMING_ID, // AWS
  be13961a0a: PROGRAMMING_ID, // Flutter
  "14d45cd393": PROGRAMMING_ID, // Storybook
  e5e239560b: PROGRAMMING_ID, // HTML
  dbbae1b99a: PROGRAMMING_ID, // VBA
  c5c75c9a97: PROGRAMMING_ID, // Spredsheets
  "2fe840e132": PROGRAMMING_ID, // GAS
  faba1e00af: PROGRAMMING_ID, // Excel
  "423af599b3": CAREER_ID, // 転職
  "770a5f097c": COLUMN_ID, // Uncategorized
};

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

async function categoryExists(id) {
  try {
    await api(`/categories/${id}?fields=id`);
    return true;
  } catch {
    return false;
  }
}

// 旧カテゴリのいずれかが付いた記事を全件集める（重複は id で除去）
async function listTargets() {
  const byId = new Map();
  for (const oldId of Object.keys(MAPPING)) {
    let offset = 0;
    for (;;) {
      const data = await api(
        `/blog?filters=categories[contains]${oldId}&fields=id,title,categories,category&limit=100&offset=${offset}`
      );
      for (const post of data.contents) byId.set(post.id, post);
      offset += 100;
      if (offset >= data.totalCount) break;
    }
  }
  return [...byId.values()];
}

async function run() {
  console.log(APPLY ? "=== APPLY モード（本番を書き換えます） ===" : "=== dry-run（--apply で実行） ===");

  // 1. コラム カテゴリの作成
  if (await categoryExists(COLUMN_ID)) {
    console.log(`カテゴリ「コラム」(${COLUMN_ID}) は作成済み`);
  } else {
    console.log(`カテゴリ「コラム」(${COLUMN_ID}) を作成${APPLY ? "" : "（dry-run のためスキップ）"}`);
    if (APPLY) {
      await api(`/categories/${COLUMN_ID}`, { method: "PUT", body: JSON.stringify({ name: "コラム" }) });
    }
  }

  // 2. 記事のカテゴリ付け替え
  const targets = await listTargets();
  console.log(`対象: ${targets.length} 記事`);

  for (const post of targets) {
    // 旧カテゴリ → 新カテゴリ に差し替え（対象外のカテゴリは維持・重複は除去）
    const ids = (post.categories || []).map((c) => MAPPING[c.id] ?? c.id);
    const deduped = [...new Set(ids)];

    const payload = { categories: deduped };
    // 単一参照フィールドへ移行済みの場合（Issue #12）はそちらも付け替える
    if (post.category && MAPPING[post.category.id]) {
      payload.category = MAPPING[post.category.id];
    }

    console.log(
      `[${post.id}] ${(post.categories || []).map((c) => c.name).join(",")} -> ${deduped.join(",")} | ${post.title.slice(0, 40)}`
    );
    if (APPLY) {
      await api(`/blog/${post.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      console.log(`[${post.id}] PATCH 完了`);
    }
  }

  // 3. 旧カテゴリの削除（参照が残っていないことを確認してから）
  for (const oldId of Object.keys(MAPPING)) {
    const remaining = await api(`/blog?filters=categories[contains]${oldId}&fields=id&limit=1`);
    if (remaining.totalCount > 0) {
      console.log(`旧カテゴリ ${oldId}: まだ ${remaining.totalCount} 記事が参照中のため削除しない`);
      continue;
    }
    if (!(await categoryExists(oldId))) {
      console.log(`旧カテゴリ ${oldId}: 削除済み`);
      continue;
    }
    console.log(`旧カテゴリ ${oldId} を削除${APPLY ? "" : "（dry-run のためスキップ）"}`);
    if (APPLY) {
      await api(`/categories/${oldId}`, { method: "DELETE" });
    }
  }

  console.log(
    APPLY
      ? "完了。旧カテゴリが「参照中のため削除しない」と出た場合は、再実行すると削除まで進みます。"
      : "dry-run 完了。問題なければ --apply を付けて実行してください。"
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
