import { sanitizeArticleHtml } from "@/components/article-body/sanitize-article-html";

// 記事本文の後処理（Issue #67 / #69）。サーバーサイド専用。
//
// XSS 対策の絶対要件（#67）: 見出しへの id 付与は必ずサニタイズ「後」に行う。
// sanitizeArticleHtml を通した安全な HTML に対し、本文テキストからは導出しない
// 自前生成の英数字 id（toc-N）を付けるだけなので、サニタイズの安全性を損なわない。

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type ArticleContent = {
  // 目次生成用の見出し一覧（本文中の h2 / h3）
  headings: TocItem[];
  // 本文を h2 区切りで分割したセグメント（先頭は最初の h2 より前の導入部）。
  // インライン CTA（#69）を本文途中に挿入するために使う。
  // これらを連結すると id 付与済みの本文 HTML 全体になる。
  segments: string[];
};

// h2/h3 に付与する id は英数字固定（toc-0, toc-1, ...）にする。
// 日本語見出しをスラッグ化すると URL エンコードで崩れやすく、
// SSR とクライアントで id が食い違うと目次リンクが機能しなくなるため。
function headingId(index: number): string {
  return `toc-${index}`;
}

export async function buildArticleContent(
  rawHtml: string
): Promise<ArticleContent> {
  const safe = sanitizeArticleHtml(rawHtml);

  // jsdom はサーバーサイドのみ。取得できない場合は目次・分割なしでそのまま返す
  if (typeof window !== "undefined") {
    return { headings: [], segments: [safe] };
  }

  let document: Document;
  try {
    const { JSDOM } = await import("jsdom");
    document = new JSDOM(`<!DOCTYPE html><body>${safe}</body>`).window.document;
  } catch {
    return { headings: [], segments: [safe] };
  }

  const body = document.body;

  // 見出しへ id を付与し、目次項目を収集する
  const headings: TocItem[] = [];
  body.querySelectorAll("h2, h3").forEach((el) => {
    const text = (el.textContent || "").trim();
    if (!text) return;
    const id = headingId(headings.length);
    el.setAttribute("id", id);
    headings.push({ id, text, level: el.tagName === "H2" ? 2 : 3 });
  });

  // トップレベルの h2 直前で本文を区切ってセグメント化する。
  // （見出しが div 等でネストされている記事は分割されず 1 セグメントになる＝安全側）
  const segments: string[] = [];
  let current = "";
  Array.from(body.children).forEach((el) => {
    if (el.tagName === "H2" && current !== "") {
      segments.push(current);
      current = "";
    }
    current += el.outerHTML;
  });
  if (current !== "") segments.push(current);
  if (segments.length === 0) segments.push(safe);

  return { headings, segments };
}

// インライン CTA を挿入するセグメント境界の index を決める（#69）。
// 「本文途中」に 1 箇所だけ差し込む。導入部・末尾に寄りすぎないよう、
// 十分にセグメントがある記事でのみ 2 番目の h2 セクションの後に置く。
// 挿入不要な場合は null を返す。
export function inlineCtaSegmentIndex(segmentCount: number): number | null {
  // 少なくとも「導入 + 3 セクション」= 4 セグメント無い記事には挿入しない
  if (segmentCount < 4) return null;
  // 0=導入, 1=1つ目のh2, 2=2つ目のh2 … の後（index 2 の直後）に挿入
  return 2;
}
