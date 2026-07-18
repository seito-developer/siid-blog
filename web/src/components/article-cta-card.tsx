import { Youtube } from "lucide-react";
import CtaLink from "./cta-link";
import {
  COUNSELING_URL,
  DOCUMENT_REQUEST_URL,
  LINE_LP_URL,
  X_URL,
  YOUTUBE_SEITO_URL,
  YOUTUBE_SIID_URL,
} from "@/app/links";

// 記事末の統合 CTA カード（Issue #57）。
// 無料個別面談（主）/ 資料請求・公式LINE（副）の3導線 + SNS リンク。
// UTM 付与・GA4 送信は CtaLink 側でまとめて行う（docs/ANALYTICS.md）。
const CTA_POSITION = "article_bottom";

export default function ArticleCtaCard({ slug }: { slug: string }) {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-12">
      <div className="rounded-2xl bg-[#214a4a] text-white px-6 py-10 sm:px-10 text-center">
        <h2 className="text-2xl font-bold mb-3">
          プログラミングを本気で学ぶなら SiiD
        </h2>
        <p className="text-sm sm:text-base text-white/90 mb-8 leading-relaxed">
          登録者数12万人超の YouTube チャンネルを運営するセイト先生から学べる、
          <br className="hidden sm:block" />
          オンラインのAIプログラミングスクールです。
        </p>

        <div className="flex flex-col items-center gap-4">
          {/* 主導線: 無料個別面談（白背景 × #214a4a でコントラスト AA を確保） */}
          <CtaLink
            baseUrl={COUNSELING_URL}
            ctaType="counseling"
            ctaPosition={CTA_POSITION}
            articleSlug={slug}
            className="inline-block w-full sm:w-auto sm:min-w-80 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#214a4a] transition-opacity hover:opacity-85"
          >
            無料個別面談に申し込む
          </CtaLink>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch justify-center gap-4">
            <CtaLink
              baseUrl={DOCUMENT_REQUEST_URL}
              ctaType="document"
              ctaPosition={CTA_POSITION}
              articleSlug={slug}
              className="inline-block rounded-full border-2 border-white px-8 py-3 font-bold text-white transition-colors hover:bg-white hover:text-[#214a4a]"
            >
              資料請求はこちら
            </CtaLink>
            <CtaLink
              baseUrl={LINE_LP_URL}
              ctaType="line"
              ctaPosition={CTA_POSITION}
              articleSlug={slug}
              className="inline-block rounded-full border-2 border-white px-8 py-3 font-bold text-white transition-colors hover:bg-white hover:text-[#214a4a]"
            >
              公式LINEで特典を受け取る
            </CtaLink>
          </div>
        </div>

        <p className="text-xs text-white/80 mt-4">
          公式LINEでは学習・転職ノウハウの豪華特典11個を無料配布中！
        </p>

        {/* SNS リンク（YouTube / X）はカード下部にまとめる */}
        <div className="mt-8 pt-6 border-t border-white/25 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <CtaLink
            baseUrl={YOUTUBE_SEITO_URL}
            ctaType="youtube_seito"
            ctaPosition={CTA_POSITION}
            articleSlug={slug}
            className="flex items-center gap-1.5 text-white/90 hover:text-white underline"
          >
            <Youtube className="w-4 h-4" aria-hidden />
            セイト先生メイン
          </CtaLink>
          <CtaLink
            baseUrl={YOUTUBE_SIID_URL}
            ctaType="youtube_siid"
            ctaPosition={CTA_POSITION}
            articleSlug={slug}
            className="flex items-center gap-1.5 text-white/90 hover:text-white underline"
          >
            <Youtube className="w-4 h-4" aria-hidden />
            SiiD受講生さま実績
          </CtaLink>
          <CtaLink
            baseUrl={X_URL}
            ctaType="x"
            ctaPosition={CTA_POSITION}
            articleSlug={slug}
            className="flex items-center gap-1.5 text-white/90 hover:text-white underline"
          >
            <span className="font-bold" aria-hidden>
              𝕏
            </span>
            X（旧Twitter）
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
