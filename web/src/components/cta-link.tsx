"use client";

import { withUtm } from "@/libs/utm";

// CTA リンク（Issue #57 / #61）。
// UTM 付与（withUtm）と GA4 イベント送信を1箇所にまとめ、
// UTM の utm_content と GA の cta_type/cta_position が食い違わないようにする。
// イベント・UTM 設計は docs/ANALYTICS.md を参照。

type CtaLinkProps = {
  baseUrl: string; // UTM 付与前の遷移先 URL
  ctaType: string; // counseling / document / line / youtube / x など
  ctaPosition: string; // article_bottom など CTA の設置位置
  articleSlug: string;
  className?: string;
  children: React.ReactNode;
};

export default function CtaLink({
  baseUrl,
  ctaType,
  ctaPosition,
  articleSlug,
  className,
  children,
}: CtaLinkProps) {
  const href = withUtm(baseUrl, {
    campaign: articleSlug,
    content: `${ctaPosition}_${ctaType}`,
  });

  const handleClick = () => {
    // gtag 未ロード（広告ブロッカー等）でもリンク遷移は妨げない
    window.gtag?.("event", "cta_click", {
      cta_type: ctaType,
      cta_position: ctaPosition,
      article_slug: articleSlug,
      link_url: href,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
