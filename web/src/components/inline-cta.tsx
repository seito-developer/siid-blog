import { ArrowRight } from "lucide-react";
import CtaLink from "./cta-link";
import { COUNSELING_URL } from "@/app/links";

// 本文途中のインライン CTA（Issue #69）。
// 文脈接続型の控えめなカード。ポップアップは使わない多点配置の一つ。
// utm_content で位置を識別（cta_position="inline"）。GA4 送信は CtaLink に集約。

export default function InlineCta({ slug }: { slug: string }) {
  return (
    <aside className="not-prose rounded-xl border border-[#289B8F]/30 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="font-bold text-[#214a4a]">
          「本気で学んでみたい」と思ったら
        </p>
        <p className="mt-1 text-sm text-gray-600">
          現役エンジニア＆元人事のプロに、無料の個別面談で相談できます。
        </p>
      </div>
      <CtaLink
        baseUrl={COUNSELING_URL}
        ctaType="counseling"
        ctaPosition="inline"
        articleSlug={slug}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#214a4a] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85 sm:mt-0 sm:w-auto sm:shrink-0"
      >
        SiiD無料カウンセリング
        <ArrowRight className="h-4 w-4" aria-hidden />
      </CtaLink>
    </aside>
  );
}
