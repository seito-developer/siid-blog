import { withRetry, type RetryOptions } from "./retry";

type Page<T> = { contents: T[]; totalCount: number };

type FetchAllPagesOptions = {
  /** 1リクエストあたりの取得件数（microCMS の上限は 100） */
  limit?: number;
  /** ページ間の待機時間（ms）。短時間にリクエストを集中させないため */
  intervalMs?: number;
  sleep?: (ms: number) => Promise<void>;
  retry?: RetryOptions;
  label?: string;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// microCMS の一覧をページングで全件取得する（#104）。
// SDK の getAllContents は初回に全ページを並列取得し 429 を踏みやすいため、
// 1ページずつ間隔を空けて取得し、各ページに指数バックオフ付きリトライをかける
export async function fetchAllPages<T>(
  getPage: (offset: number, limit: number) => Promise<Page<T>>,
  {
    limit = 100,
    intervalMs = 200,
    sleep = defaultSleep,
    retry,
    label = "list",
  }: FetchAllPagesOptions = {}
): Promise<T[]> {
  const items: T[] = [];
  for (let offset = 0; ; offset += limit) {
    if (offset > 0) {
      await sleep(intervalMs);
    }
    const page = await withRetry(() => getPage(offset, limit), {
      sleep,
      ...retry,
      label: `${label} offset=${offset}`,
    });
    items.push(...page.contents);
    if (page.contents.length === 0 || items.length >= page.totalCount) {
      return items;
    }
  }
}
