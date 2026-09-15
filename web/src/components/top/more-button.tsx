import Link from "next/link";
import { ArrowRight } from "lucide-react";

// TOP のセクション末に置く「もっと見る」ボタン（Issue #94）。
// 新着記事・受講生様実績の両セクションで使い回す。
// 内部リンクのため CtaLink（外部CTA用の UTM/GA4 付与）は使わない。

export default function MoreButton({
  href,
  label = "もっと見る",
  ariaLabel,
}: {
  href: string;
  label?: string;
  // 「もっと見る」だけではリンク一覧で意味を成さないため何の一覧かを補う。
  // WCAG 2.5.3（Label in Name）を満たすよう、可視テキスト
  // 「もっと見る」を必ず含めること（音声操作で「もっと見る」と言って
  // 反応しなくなるのを防ぐ）
  ariaLabel: string;
}) {
  return (
    <div className="mt-8 flex justify-center">
      <Link
        href={href}
        aria-label={ariaLabel}
        className="group inline-flex items-center gap-2 rounded-full border border-siid-deep bg-white px-8 py-3 text-sm font-bold text-siid-text transition-colors hover:bg-siid-text hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-siid-main focus-visible:ring-offset-2 focus-visible:ring-offset-siid-bg"
      >
        {label}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
