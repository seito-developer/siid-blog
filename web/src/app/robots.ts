import type { MetadataRoute } from "next";
import { SITE_URL } from "./constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 検索結果・ページ送りのパラメータ付き URL はクロール不要
      disallow: ["/*?q=", "/*?page="],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
