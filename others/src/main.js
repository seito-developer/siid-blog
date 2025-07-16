import fs from "fs";
import { config } from "./config.js";
import { loadXml, hashKeyword, executePostAPI } from "./libs/lib.js";
import { replaceContent } from "./libs/replace-content.js";

// ----------------------------------------
// XML 読み込み
// ----------------------------------------
const xmlFile = fs.readFileSync(`./data/${config.xmlPath}`, "utf-8");
const xmlData = await loadXml(xmlFile);
const channel = xmlData.rss.channel[0];
const items = channel.item ?? [];

// ----------------------------------------
// ヘルパー関数
// ----------------------------------------
/**
 * <item><category …></category></item> からターム一覧を抽出
 * @param {Array<object>} items - WordPress <item> 配列
 * @param {string} domain        - "category" | "post_tag" など
 * @returns {Array<{id:string,name:string}>}
 */
const pickTermsFromItems = (items, domain) => {
  const map = new Map(); // slug → name を重複なく保持
  items.forEach((item) => {
    // stripPrefix オプション有無に備え、両方のキーを試す
    const catElements = item.category ?? item.categories ?? [];
    catElements.forEach((cat) => {
      if (cat.$?.domain === domain) {
        const slug = cat.$.nicename;
        const name = cat._ ?? slug;
        if (slug && !map.has(slug)) {
          map.set(slug, name);
        }
      }
    });
  });

  return [...map.entries()].map(([slug, name]) => ({
    id: hashKeyword(slug),
    name,
  }));
};

// WordPress の投稿ステータス
const draftStatuses = [
  "draft",
  "future",
  "pending",
  "private",
  "auto-draft",
];

// ----------------------------------------
// メイン処理
// ----------------------------------------
const migrateWordPress = async () => {
  /* ================================================================== */
  /* 1. カテゴリ／タグの登録                                          */
  /* ================================================================== */
  if (config.category.execute) {
    const categoryList = pickTermsFromItems(items, config.category.taxonomy);

    if (categoryList.length !== 0) {
      if (config.api) {
        await executePostAPI(config.category.apiName, categoryList);
        console.log("カテゴリの登録処理が完了しました。");
      } else {
        console.log(
          "[Warning] config.api が false のため、カテゴリの登録は行いません。\nAPI に送信されるデータを data/output_category.json に出力しました。",
        );
        fs.writeFileSync(
          "./data/output_category.json",
          JSON.stringify(categoryList, null, 2),
        );
      }
    } else {
      console.log("[Warning] config.category.taxonomy に設定されたカテゴリが見つかりませんでした。");
    }
  }

  if (config.tag.execute) {
    const tagList = pickTermsFromItems(items, config.tag.taxonomy);

    if (tagList.length !== 0) {
      if (config.api) {
        await executePostAPI(config.tag.apiName, tagList);
        console.log("タグの登録処理が完了しました。");
      } else {
        console.log(
          "[Warning] config.api が false のため、タグの登録は行いません。\nAPI に送信されるデータを data/output_tag.json に出力しました。",
        );
        fs.writeFileSync(
          "./data/output_tag.json",
          JSON.stringify(tagList, null, 2),
        );
      }
    } else {
      console.log("[Warning] config.tag.taxonomy に設定されたタグが見つかりませんでした。");
    }
  }

  /* ================================================================== */
  /* 2. 投稿コンテンツの登録                                           */
  /* ================================================================== */
  const contents = [];
  const draftContents = [];

  // メディア (<item post_type="attachment">) を先に取り出す
  const attachmentItems = items.filter((item) =>
    (item["wp:post_type"] ?? item.post_type ?? [""])[0] === "attachment",
  );

  // 画像移行対応表があれば読み込み
  let migrateMedia = [];
  if (fs.existsSync("./data/migrateMedia.json")) {
    migrateMedia = JSON.parse(fs.readFileSync("./data/migrateMedia.json", "utf-8"));
  }

  // 移行対象記事を抽出
  let filteredItems = items.filter((item) => {
    const postType = (item["wp:post_type"] ?? item.post_type ?? [""])[0];
    const status = (item["wp:status"] ?? item.status ?? [""])[0];
    return postType === config.postType && status === "publish";
  });

  if (config.draft) {
    const draftItems = items.filter((item) => {
      const postType = (item["wp:post_type"] ?? item.post_type ?? [""])[0];
      const status = (item["wp:status"] ?? item.status ?? [""])[0];
      return postType === config.postType && draftStatuses.includes(status);
    });
    filteredItems.push(...draftItems);
  }

  if (filteredItems.length === 0) {
    console.log("[Warning] 指定した投稿タイプの記事が見つかりませんでした。");
    return;
  }

  let i = 0;
  for (const item of filteredItems) {
    // config.limit が設定されていれば途中で打ち切る
    if (config.limit !== false && config.limit !== undefined && i >= config.limit) {
      console.log("[Warning] config.limit に達しました。残りの記事は無視します。");
      break;
    }

    const contentsItem = {};
    const postId = (item["wp:post_id"] ?? item.post_id ?? [null])[0];
    contentsItem.id = hashKeyword(postId.toString());

    const status = (item["wp:status"] ?? item.status ?? [""])[0];
    const isDraftItem = draftStatuses.includes(status);

    // 公開日時
    if (!isDraftItem) {
      const pubDate = (item["wp:post_date_gmt"] ?? item.post_date_gmt ?? [null])[0];
      if (pubDate) contentsItem.publishedAt = new Date(pubDate);
    }

    // タイトル
    if (config.apiSchema.title) contentsItem.title = item.title?.[0] ?? "";

    // 本文
    if (config.apiSchema.contents) {
      const rawContent = item["content:encoded"]?.[0] ?? "";
      contentsItem.contents = replaceContent(rawContent, migrateMedia);
    }

    // 著者
    if (config.apiSchema.author) contentsItem.author = item["dc:creator"]?.[0] ?? "";

    // アイキャッチ
    if (config.apiSchema.eyecatch && !isDraftItem) {
      const thumbnailMeta = item["wp:postmeta"]?.find(
        (meta) => meta["wp:meta_key"]?.[0] === "_thumbnail_id",
      );
      if (thumbnailMeta) {
        const thumbId = thumbnailMeta["wp:meta_value"]?.[0];
        const attachment = attachmentItems.find((att) => att["wp:post_id"]?.[0] === thumbId);
        if (attachment) {
          const oldUrl = attachment["wp:attachment_url"]?.[0];
          const found = migrateMedia.find((m) => m.oldUrl === oldUrl);
          if (found) contentsItem.eyecatch = found.newUrl;
        }
      }
    }

    // カテゴリ・タグ
    const catElements = item.category ?? item.categories ?? [];
    const categoryIds = [];
    const tagIds = [];
    catElements.forEach((cat) => {
      const domain = cat.$?.domain;
      const slug = cat.$?.nicename;
      if (!domain || !slug) return;
      const hashed = hashKeyword(slug);
      if (domain === config.category.taxonomy) categoryIds.push(hashed);
      else if (domain === config.tag.taxonomy) tagIds.push(hashed);
    });
    if (config.apiSchema.categories && categoryIds.length) contentsItem.categories = categoryIds;
    if (config.apiSchema.tags && tagIds.length) contentsItem.tags = tagIds;

    // 仕分け
    if (isDraftItem) draftContents.push(contentsItem); else contents.push(contentsItem);
    i++;
  }

  // API 送信またはファイル出力
  if (config.api) {
    if (contents.length) await executePostAPI(config.apiName, contents);
    if (config.draft && draftContents.length) await executePostAPI(config.apiName, draftContents, true);
    console.log("コンテンツの登録処理が完了しました。");
  } else {
    fs.writeFileSync("./data/output_contents.json", JSON.stringify({ contents, draftContents }, null, 2));
    console.log("[Warning] config.api が false のため、API 送信をスキップしました。output_contents.json に書き出しました。");
  }
};

// ----------------------------------------
// 実行
// ----------------------------------------
migrateWordPress();
