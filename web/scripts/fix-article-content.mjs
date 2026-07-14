// Issue #41: 記事本文の壊れたリンク・複数H1見出しを microCMS 上で修正するスクリプト。
//
// 本番コンテンツを書き換えるため、オーナーが手元で実行する想定:
//
//   cd web
//   node scripts/fix-article-content.mjs           # dry-run（変更内容の確認のみ）
//   node scripts/fix-article-content.mjs --apply   # 実際に PATCH する
//
// MICROCMS_API_KEY は web/.env.local から自動読み込み（環境変数があれば優先）。
// 修正内容:
//   1. 壊れたリンク3記事（ローカル開発URL・href への注記混入・例示ドメインの実リンク化）
//   2. 本文に <h1> を含む記事の見出しレベルを一段下げる（h1→h2, h2→h3, ...）
//      ※記事タイトルがテンプレート側で h1 出力されるため、本文は h2 始まりに統一する

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API_BASE = "https://siid-web.microcms.io/api/v1/blog";
const APPLY = process.argv.includes("--apply");

// --- 1. 壊れたリンクの修正（完全一致で置換） ---
const LINK_FIXES = [
  {
    id: "start-phh-laravel-projects-with-postgresql",
    replacements: [
      // 本文冒頭: 末尾にバッククォートが混入した無効リンク → コード表記
      {
        from: '<a href="http://127.0.0.1:8000`">http://127.0.0.1:8000`</a>',
        to: "<code>http://127.0.0.1:8000</code>",
      },
      // 記事末尾: ローカル開発URLの実リンク（読者環境では無意味） → コード表記
      {
        from: '<a href="http://127.0.0.1:8000">http://127.0.0.1:8000</a>',
        to: "<code>http://127.0.0.1:8000</code>",
      },
    ],
  },
  {
    id: "qvm46tro91",
    replacements: [
      // href に全角の注記が混入して無効リンクになっている → 正しい URL に修正
      {
        from: '<a href="https://mid-works.com（運営元の公式サービスサイト）">https://mid-works.com</a>',
        to: '<a href="https://mid-works.com">https://mid-works.com</a>（運営元の公式サービスサイト）',
      },
    ],
  },
  {
    id: "security-4",
    replacements: [
      // 例示用ドメインが実リンク化され読者を誘導しかねない → コード表記
      {
        from: '<a href="http://evil.com">evil.com</a>',
        to: "<code>evil.com</code>",
      },
    ],
  },
];

// --- 2. 本文に h1 を含む記事（2026-07 時点の全件スキャン結果） ---
const H1_ARTICLE_IDS = [
  "sql-sheet",
  "sql-beginner",
  "laravel-vscode-extentions",
  "0ja54q-i6",
  "26",
  "1086d35563",
  "085b2a3887",
  "fb84a97396",
  "5b4afb8d2e",
  "fa4ddf29f4",
  "04edd1d773",
  "0d6f9709ed",
  "5fbc314fb0",
  "91a73fd806",
  "d40fbd13d5",
];

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

async function getContents(id) {
  const res = await fetch(`${API_BASE}/${id}?fields=id,title,contents`, {
    headers: { "X-MICROCMS-API-KEY": API_KEY },
  });
  if (!res.ok) throw new Error(`GET ${id} failed: ${res.status}`);
  return res.json();
}

async function patchContents(id, contents) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) throw new Error(`PATCH ${id} failed: ${res.status} ${await res.text()}`);
}

// 見出しレベルを一段下げる（h6 はそれ以上下げられないため h6 のまま）
function demoteHeadings(html) {
  return html.replace(/(<\/?)h([1-5])(?=[ >])/gi, (_, open, level) => `${open}h${Number(level) + 1}`);
}

function headingHistogram(html) {
  const counts = {};
  for (const m of html.matchAll(/<h([1-6])[ >]/gi)) {
    const key = `h${m[1]}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort()
    .map(([tag, count]) => `${tag}:${count}`)
    .join(" ");
}

async function run() {
  console.log(APPLY ? "=== APPLY モード（本番を書き換えます） ===" : "=== dry-run（--apply で実行） ===");

  for (const fix of LINK_FIXES) {
    const post = await getContents(fix.id);
    let html = post.contents;
    let applied = 0;
    for (const { from, to } of fix.replacements) {
      if (html.includes(from)) {
        html = html.split(from).join(to);
        applied += 1;
      } else {
        console.warn(`[${fix.id}] 置換対象が見つかりません（修正済みの可能性）: ${from.slice(0, 60)}...`);
      }
    }
    console.log(`[${fix.id}] リンク修正 ${applied}/${fix.replacements.length} 件`);
    if (APPLY && applied > 0) {
      await patchContents(fix.id, html);
      console.log(`[${fix.id}] PATCH 完了`);
    }
  }

  for (const id of H1_ARTICLE_IDS) {
    const post = await getContents(id);
    const before = headingHistogram(post.contents);
    if (!/<h1[ >]/i.test(post.contents)) {
      console.log(`[${id}] h1 なし（修正済み）: ${before}`);
      continue;
    }
    const demoted = demoteHeadings(post.contents);
    console.log(`[${id}] 見出しを一段下げ: ${before} -> ${headingHistogram(demoted)} | ${post.title.slice(0, 40)}`);
    if (APPLY) {
      await patchContents(id, demoted);
      console.log(`[${id}] PATCH 完了`);
    }
  }

  console.log(APPLY ? "完了しました。" : "dry-run 完了。問題なければ --apply を付けて実行してください。");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
