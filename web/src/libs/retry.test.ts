import { describe, expect, it, vi } from "vitest";
import { backoffDelay, isRetryableError, withRetry } from "./retry";

const noSleep = () => Promise.resolve();

describe("isRetryableError", () => {
  it("429 と 5xx はリトライ対象", () => {
    expect(isRetryableError(new Error("fetch API response status: 429"))).toBe(true);
    expect(isRetryableError(new Error("Failed to fetch blog post: a (status 503)"))).toBe(true);
    expect(isRetryableError(new Error("Too many requests, please try again later."))).toBe(true);
  });

  it("429 以外の 4xx・ステータス無し・Error 以外は対象外", () => {
    expect(isRetryableError(new Error("fetch API response status: 404"))).toBe(false);
    expect(isRetryableError(new Error("network down"))).toBe(false);
    expect(isRetryableError("status: 429")).toBe(false);
  });
});

describe("backoffDelay", () => {
  it("回数ごとに倍々で伸び、上限で頭打ちになる", () => {
    const max = () => 1;
    expect(backoffDelay(0, 1000, 16000, max)).toBe(1000);
    expect(backoffDelay(1, 1000, 16000, max)).toBe(2000);
    expect(backoffDelay(3, 1000, 16000, max)).toBe(8000);
    expect(backoffDelay(10, 1000, 16000, max)).toBe(16000);
  });

  it("ジッターで半分〜等倍の範囲に収まる", () => {
    expect(backoffDelay(2, 1000, 16000, () => 0)).toBe(2000);
    expect(backoffDelay(2, 1000, 16000, () => 1)).toBe(4000);
  });
});

describe("withRetry", () => {
  it("一時的な 429 の後に成功すれば結果を返す", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fetch API response status: 429"))
      .mockRejectedValueOnce(new Error("fetch API response status: 500"))
      .mockResolvedValue("ok");
    await expect(withRetry(fn, { sleep: noSleep })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("リトライ回数を使い切ったら最後のエラーを投げる", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fetch API response status: 429"));
    await expect(withRetry(fn, { retries: 2, sleep: noSleep })).rejects.toThrow("429");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("リトライ対象外のエラーは即座に投げる", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fetch API response status: 401"));
    await expect(withRetry(fn, { sleep: noSleep })).rejects.toThrow("401");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
