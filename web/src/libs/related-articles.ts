import { client } from "@/libs/microcms";
import { fetchAllPages } from "@/libs/fetch-all-pages";
import { filterPublished } from "@/libs/published";
import { getArticleCategory } from "@/libs/article-category";
import { BLOG_API_ENDPOINT } from "@/app/constants";
import { ArticleProps } from "@/interfaces/common";

// 関連記事の取得ロジック（Issue #56）。
// タイトルの似ている記事（自分自身は除外）を上位から選ぶ。似ている記事が足りない分は
// 同カテゴリの最新記事、それも無ければ全体の最新記事で補う。
// 以前は「同カテゴリの最新3本」だったため、どの記事からも新着にリンクが集中し、
// 古い記事へのリンク経路が無かった（SEO コンサルタントの指摘）。
// 記事詳細の本文末（SP）とサイドバー（PC）で同じ結果を使い回すため、
// 取得はページ側で1回だけ行い、各表示コンポーネントには props で渡す。

export const RELATED_ARTICLES_LIMIT = 3;

// これ未満のスコアは「似ていない」とみなし、カテゴリの新着で補う
export const MIN_SIMILARITY = 0.08;
// 英単語（python, pandas 等）は技術テーマを強く表すため、日本語の bigram より重く扱う
const ASCII_WORD_WEIGHT = 3;
// 同じカテゴリの記事を少しだけ優先する
const SAME_CATEGORY_BONUS = 0.03;
// 記事一覧のキャッシュ時間。ビルド中は全記事ページで1回の取得を使い回し、
// 実行時（ISR）は古くなりすぎないよう取り直す
const INDEX_TTL_MS = 60 * 60 * 1000;

type RelatedCandidate = Pick<
  ArticleProps,
  "id" | "title" | "publishedAt" | "category" | "categories"
>;

// タイトルを特徴語に分ける。英単語は小文字化してそのまま、日本語は2文字ずつ（bigram）にする。
// 記号・数字・括弧で区切り、区切りをまたぐ bigram は作らない
export function titleTokens(title: string): Map<string, number> {
  const tokens = new Map<string, number>();
  const lower = title.toLowerCase();
  for (const word of lower.match(/[a-z][a-z0-9+#]*/g) ?? []) {
    if (word.length >= 2) {
      tokens.set(`w:${word}`, ASCII_WORD_WEIGHT);
    }
  }
  const japaneseRuns = lower
    .replace(/[a-z0-9+#]+/g, " ")
    .split(/[\s\p{P}\p{S}０-９]+/u)
    .filter((run) => run.length >= 2);
  for (const run of japaneseRuns) {
    for (let i = 0; i < run.length - 1; i++) {
      tokens.set(`j:${run.slice(i, i + 2)}`, 1);
    }
  }
  return tokens;
}

// 多くのタイトルに出る語（「エンジニア」「プログラミング」等）ほど軽くする（IDF）
function buildIdf(tokenSets: Map<string, number>[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const tokens of tokenSets) {
    for (const token of tokens.keys()) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  const total = tokenSets.length;
  const idf = new Map<string, number>();
  for (const [token, count] of df) {
    idf.set(token, Math.log((total + 1) / count));
  }
  return idf;
}

// 2つの特徴語の重み付きコサイン類似度（0〜1）
function cosine(
  a: Map<string, number>,
  b: Map<string, number>,
  idf: Map<string, number>
): number {
  const weight = (token: string, base: number) => base * (idf.get(token) ?? 0);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [token, base] of a) {
    const w = weight(token, base);
    normA += w * w;
    const other = b.get(token);
    if (other !== undefined) {
      dot += w * weight(token, other);
    }
  }
  for (const [token, base] of b) {
    const w = weight(token, base);
    normB += w * w;
  }
  return normA > 0 && normB > 0 ? dot / Math.sqrt(normA * normB) : 0;
}

const byNewest = (a: RelatedCandidate, b: RelatedCandidate) =>
  b.publishedAt.localeCompare(a.publishedAt);

// 記事一覧から関連記事を選ぶ（純関数。テスト対象）
export function rankRelatedArticles<T extends RelatedCandidate>(
  currentId: string,
  categoryId: string | undefined,
  articles: T[],
  limit: number = RELATED_ARTICLES_LIMIT
): T[] {
  const current = articles.find((article) => article.id === currentId);
  const others = articles.filter((article) => article.id !== currentId);
  const sameCategory = (article: T) =>
    categoryId !== undefined && getArticleCategory(article)?.id === categoryId;

  const picked: T[] = [];
  if (current) {
    const tokenSets = articles.map((article) => titleTokens(article.title));
    const idf = buildIdf(tokenSets);
    const currentTokens = titleTokens(current.title);
    const scored = others
      .map((article) => ({
        article,
        score:
          cosine(currentTokens, titleTokens(article.title), idf) +
          (sameCategory(article) ? SAME_CATEGORY_BONUS : 0),
      }))
      .filter(({ score }) => score >= MIN_SIMILARITY)
      .sort(
        (a, b) => b.score - a.score || byNewest(a.article, b.article)
      );
    picked.push(...scored.slice(0, limit).map(({ article }) => article));
  }

  // 足りない分は同カテゴリの新着 → 全体の新着の順で補う
  const fallbacks = [
    ...others.filter(sameCategory).sort(byNewest),
    ...[...others].sort(byNewest),
  ];
  for (const article of fallbacks) {
    if (picked.length >= limit) break;
    if (!picked.includes(article)) {
      picked.push(article);
    }
  }
  return picked;
}

let indexCache: { expiresAt: number; articles: Promise<ArticleProps[]> } | null =
  null;

// 関連記事の候補となる公開済み全記事（本文を除く）。
// 記事ページごとに取得すると全記事ページのビルドで 429 を踏むため、プロセス内で使い回す（#104）
function getArticleIndex(): Promise<ArticleProps[]> {
  const now = Date.now();
  if (!indexCache || indexCache.expiresAt <= now) {
    const articles = fetchAllPages(
      (offset, limit) =>
        client.getList<ArticleProps>({
          endpoint: BLOG_API_ENDPOINT,
          queries: {
            fields:
              "id,title,publishedAt,category,categories,eyecatch,thumbnailPreset,author",
            offset,
            limit,
          },
        }),
      { label: "related articles" }
    ).then(filterPublished);
    indexCache = { expiresAt: now + INDEX_TTL_MS, articles };
    // 失敗した取得はキャッシュせず、次の呼び出しで取り直す
    articles.catch(() => {
      if (indexCache?.articles === articles) {
        indexCache = null;
      }
    });
  }
  return indexCache.articles;
}

export async function getRelatedArticles(
  categoryId: string | undefined,
  currentId: string,
  limit: number = RELATED_ARTICLES_LIMIT
): Promise<ArticleProps[]> {
  try {
    return rankRelatedArticles(currentId, categoryId, await getArticleIndex(), limit);
  } catch {
    // 関連記事の取得失敗（リトライ後も失敗）で記事ページ全体を落とさない
    return [];
  }
}
