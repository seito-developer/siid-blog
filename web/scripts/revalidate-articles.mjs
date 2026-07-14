// Issue #54: 記事詳細ページの ISR キャッシュを手動で再検証する。
//
// 本番の /api/revalidate（microCMS Webhook の受け口）に署名付き POST を送り、
// 記事ごとのキャッシュタグ（blog-<id>）を再検証する。
// カテゴリ移行（Issue #51）が本番デプロイのビルドと同時刻に走ったため、
// 旧カテゴリ名が焼き込まれた静的ページが残った——その修復用。
// 今後も「データは正しいのにページが古い」ときに使える。
//
// 使い方（オーナーが手元で実行する想定）:
//
//   cd web
//   MICROCMS_WEBHOOK_SECRET=<本番と同じ値> node scripts/revalidate-articles.mjs           # 全記事
//   MICROCMS_WEBHOOK_SECRET=<...> node scripts/revalidate-articles.mjs --ids id1,id2      # 指定記事のみ
//   MICROCMS_WEBHOOK_SECRET=<...> node scripts/revalidate-articles.mjs --site http://localhost:3000  # 送信先の変更
//
// シークレットは Vercel の環境変数 MICROCMS_WEBHOOK_SECRET と同じ値
// （microCMS 管理画面 > API 設定 > Webhook にも設定されているもの）。
// MICROCMS_API_KEY は web/.env.local から自動読み込み（記事 ID の列挙に使用）。

import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MICROCMS_API_BASE = "https://siid-web.microcms.io/api/v1";
const DEFAULT_SITE = "https://blog.bug-fix.org";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { site: DEFAULT_SITE, ids: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--site" && args[i + 1]) opts.site = args[++i];
    else if (args[i] === "--ids" && args[i + 1]) opts.ids = args[++i].split(",").filter(Boolean);
    else {
      console.error(`不明な引数: ${args[i]}`);
      process.exit(1);
    }
  }
  return opts;
}

function loadEnvLocal(name) {
  if (process.env[name]) return process.env[name];
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
  try {
    const match = readFileSync(envPath, "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
    // 引用符付きの値（KEY="..."）でも署名が壊れないよう外して返す
    if (match) return match[1].trim().replace(/^(["'])(.*)\1$/, "$2");
  } catch {
    // .env.local が無い場合は環境変数必須
  }
  return undefined;
}

const WEBHOOK_SECRET = loadEnvLocal("MICROCMS_WEBHOOK_SECRET");
if (!WEBHOOK_SECRET) {
  console.error("MICROCMS_WEBHOOK_SECRET が見つかりません（環境変数で渡してください）");
  process.exit(1);
}

// 全記事 ID を microCMS から列挙する
async function listAllArticleIds() {
  const apiKey = loadEnvLocal("MICROCMS_API_KEY");
  if (!apiKey) {
    console.error("MICROCMS_API_KEY が見つかりません（環境変数か web/.env.local に設定してください）");
    process.exit(1);
  }
  const ids = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${MICROCMS_API_BASE}/blog?fields=id&limit=100&offset=${offset}`, {
      headers: { "X-MICROCMS-API-KEY": apiKey },
    });
    if (!res.ok) throw new Error(`記事一覧の取得に失敗: ${res.status} ${await res.text()}`);
    const data = await res.json();
    if (data.contents.length === 0) return ids;
    ids.push(...data.contents.map((c) => c.id));
    offset += 100;
    if (offset >= data.totalCount) return ids;
  }
}

// /api/revalidate が期待する microCMS Webhook と同じ形式・署名で POST する
async function revalidate(site, id) {
  const body = JSON.stringify({ api: "blog", id });
  const signature = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
  const res = await fetch(`${site}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-microcms-signature": signature,
    },
    body,
  });
  const text = await res.text();
  // ルートは対象外のリクエストにも 200（"Nothing to revalidate"）を返すため、
  // 実際に再検証されたことまで確認する
  if (!res.ok || !text.includes('"revalidated":true')) {
    throw new Error(`revalidate ${id} failed: ${res.status} ${text}`);
  }
  return text;
}

async function run() {
  const { site, ids } = parseArgs();
  const targets = ids ?? (await listAllArticleIds());
  console.log(`送信先: ${site}/api/revalidate`);
  console.log(`対象: ${targets.length} 記事`);

  let ok = 0;
  const failed = [];
  for (const id of targets) {
    try {
      await revalidate(site, id);
      ok++;
      process.stdout.write(`\r再検証済み: ${ok}/${targets.length}`);
    } catch (err) {
      failed.push(id);
      console.error(`\n[${id}] ${err.message}`);
    }
  }
  console.log();

  if (failed.length > 0) {
    console.error(`失敗: ${failed.length} 件 → 再実行: node scripts/revalidate-articles.mjs --ids ${failed.join(",")}`);
    process.exit(1);
  }
  console.log("完了。ブラウザで該当記事のカテゴリ表示が更新されたことを確認してください。");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
