"use client";

// CTA クリックを GA4 カスタムイベントとして送信するリンク（Issue #61）。
// イベント設計は docs/ANALYTICS.md を参照。
// UTM の付与は呼び出し側（withUtm）で済ませた href を渡すこと。

type CtaLinkProps = {
  href: string;
  ctaType: string; // counseling / document / line / youtube / x など
  ctaPosition: string; // article_bottom など CTA の設置位置
  articleSlug: string;
  className?: string;
  children: React.ReactNode;
};

export default function CtaLink({
  href,
  ctaType,
  ctaPosition,
  articleSlug,
  className,
  children,
}: CtaLinkProps) {
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
