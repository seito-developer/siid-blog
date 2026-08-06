"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// window.gtag の型は src/types/gtag.d.ts で共有宣言している

export default function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;
    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: pathname + searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}
