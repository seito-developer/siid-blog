// microCMS のレート制限（429）や一時的な 5xx に備えた、指数バックオフ付きリトライ（#104）

export type RetryOptions = {
  /** 初回を除く最大リトライ回数 */
  retries?: number;
  /** 1回目のリトライ前の待機時間（ms）。以降は 2 倍ずつ伸びる */
  baseDelayMs?: number;
  /** 待機時間の上限（ms） */
  maxDelayMs?: number;
  /** リトライ対象のエラーか判定する */
  shouldRetry?: (error: unknown) => boolean;
  /** テスト用に差し替え可能な待機関数 */
  sleep?: (ms: number) => Promise<void>;
  /** ログ用のラベル */
  label?: string;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// 429 / 5xx を含むエラーメッセージか判定する。
// SDK は "fetch API response status: 429"、getBlogPost は "(status 429)" の形式で投げる
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (/too many requests/i.test(error.message)) return true;
  const match = error.message.match(/status:?\s*(\d{3})/);
  if (!match) return false;
  const status = Number(match[1]);
  return status === 429 || status >= 500;
}

// n 回目（0 始まり）のリトライ前の待機時間。ジッターを入れて同時リトライの集中を避ける
export function backoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  random: () => number = Math.random
): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.round(exponential / 2 + (random() * exponential) / 2);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    retries = 4,
    baseDelayMs = 1000,
    maxDelayMs = 16000,
    shouldRetry = isRetryableError,
    sleep = defaultSleep,
    label = "request",
  }: RetryOptions = {}
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) {
        throw error;
      }
      const delay = backoffDelay(attempt, baseDelayMs, maxDelayMs);
      console.warn(
        `[retry] ${label} failed (${attempt + 1}/${retries}), retrying in ${delay}ms`
      );
      await sleep(delay);
    }
  }
}
