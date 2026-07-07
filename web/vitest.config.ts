import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // formatDate 等のローカルタイムゾーン依存処理を実行環境によらず再現可能にする
    env: { TZ: "Asia/Tokyo" },
  },
});
