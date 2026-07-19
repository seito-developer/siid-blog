"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { withUtm } from "@/libs/utm";
import { LINE_URL } from "@/app/links";

// SP 限定の画面下部追従 CTA バー（Issue #69）。
// - SP のみ表示（lg 以上では非表示）
// - 閉じるボタンで消せる。閉じたらセッション中は再表示しない（sessionStorage）
// - 訪問直後のポップアップ/モーダルは出さない（インタースティシャル回避）ため、
//   常設の控えめなバーとして下部に固定する
// UTM は withUtm で付与し、GA4 は onClick で送信（cta_position="sticky_bar"）。

const DISMISS_KEY = "sp_sticky_cta_dismissed";
const CTA_POSITION = "sticky_bar";
const CTA_TYPE = "line";

export default function SpStickyCta({ slug }: { slug: string }) {
  // SSR では出さず、マウント後に未 dismiss なら表示する（ちらつき・hydration 差異回避）
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const href = withUtm(LINE_URL, {
    campaign: slug,
    content: `${CTA_POSITION}_${CTA_TYPE}`,
  });

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // sessionStorage 不可でもバーを閉じる動作は行う
    }
  };

  const handleClick = () => {
    window.gtag?.("event", "cta_click", {
      cta_type: CTA_TYPE,
      cta_position: CTA_POSITION,
      article_slug: slug,
      link_url: href,
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#214a4a] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          LINEで無料相談する
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="追従バーを閉じる"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
