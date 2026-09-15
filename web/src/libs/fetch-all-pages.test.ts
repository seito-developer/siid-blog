import { describe, expect, it, vi } from "vitest";
import { fetchAllPages } from "./fetch-all-pages";

const noSleep = () => Promise.resolve();

// 0..total-1 の id を持つ一覧を返す擬似 API
const fakeApi = (total: number) =>
  vi.fn(async (offset: number, limit: number) => ({
    contents: Array.from(
      { length: Math.max(0, Math.min(limit, total - offset)) },
      (_, i) => ({ id: offset + i })
    ),
    totalCount: total,
  }));

describe("fetchAllPages", () => {
  it("全ページを順番に取得して結合する", async () => {
    const api = fakeApi(250);
    const items = await fetchAllPages(api, { limit: 100, sleep: noSleep });
    expect(items).toHaveLength(250);
    expect(items[249]).toEqual({ id: 249 });
    expect(api.mock.calls).toEqual([
      [0, 100],
      [100, 100],
      [200, 100],
    ]);
  });

  it("0件なら1リクエストで終わる", async () => {
    const api = fakeApi(0);
    await expect(fetchAllPages(api, { sleep: noSleep })).resolves.toEqual([]);
    expect(api).toHaveBeenCalledTimes(1);
  });

  it("ページ間で待機する", async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(noSleep);
    await fetchAllPages(fakeApi(250), { limit: 100, intervalMs: 300, sleep });
    expect(sleep.mock.calls.filter(([ms]) => ms === 300)).toHaveLength(2);
  });

  it("途中のページで 429 が出てもリトライして全件取得する", async () => {
    const api = fakeApi(150);
    api.mockRejectedValueOnce(new Error("fetch API response status: 429"));
    const items = await fetchAllPages(api, { limit: 100, sleep: noSleep });
    expect(items).toHaveLength(150);
  });

  it("リトライを使い切ったらエラーを投げる", async () => {
    const api = vi.fn().mockRejectedValue(new Error("fetch API response status: 429"));
    await expect(
      fetchAllPages(api, { sleep: noSleep, retry: { retries: 1 } })
    ).rejects.toThrow("429");
  });
});
