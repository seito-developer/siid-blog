import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { INTERVIEW_CATEGORY_SLUG } from "@/app/category/categories";

// 受講生様実績一覧への導線カード。記事詳細のサイドバー（PC）と
// 本文末の縦積みブロック（SP）の両方で使う。
// 内部リンクのため CtaLink（外部CTA用の UTM/GA4 付与）は使わない。

export default function InterviewLinkCard() {
  return (
    <section
      aria-label="受講生様実績"
      className="rounded-2xl border border-[#289B8F]/30 bg-white p-5"
    >
      <p className="flex items-center gap-2 text-base font-bold text-[#214a4a]">
        <Sparkles className="h-4 w-4 text-[#289B8F]" aria-hidden />
        受講生様の転職実績
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        未経験からエンジニアへ。SiiD で学んだ受講生様のリアルな歩みをご紹介しています。
      </p>
      <Link
        href={`/category/${INTERVIEW_CATEGORY_SLUG}`}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#289B8F] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#214a4a]"
      >
        実績を見る
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
