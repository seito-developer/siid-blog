import CtaLink from "./cta-link";
import { COUNSELING_URL } from "@/app/links";

// 記事末の CTA カード（Issue #57）。
// ユーザーを迷わせないよう無料個別面談の1導線に特化する（レビュー反映）。
// UTM 付与・GA4 送信は CtaLink 側でまとめて行う（docs/ANALYTICS.md）。
const CTA_POSITION = "article_bottom";

export default function ArticleCtaCard({ slug }: { slug: string }) {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-12">
      <div className="rounded-2xl bg-[#214a4a] text-white px-6 py-10 sm:px-10 text-center">
        <h2 className="text-2xl font-bold mb-3">
          未経験からのエンジニア転職を本気で目指すなら「SiiD」
        </h2>
        <p className="text-sm sm:text-base text-white/90 mb-8 leading-relaxed">
          SiiDはYouTube 13万人のセイト先生が主任講師のAIプログラミングスクール。
          <br className="hidden sm:block" />
          元人事部長＆現役エンジニアによる徹底指導で、生涯年収を大きくアップさせませんか？
        </p>

        {/* 無料個別面談への1導線に特化（白背景 × #214a4a でコントラスト AA を確保） */}
        <CtaLink
          baseUrl={COUNSELING_URL}
          ctaType="counseling"
          ctaPosition={CTA_POSITION}
          articleSlug={slug}
          className="inline-block w-full sm:w-auto sm:min-w-80 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#214a4a] transition-opacity hover:opacity-85"
        >
          無料個別面談に申し込む
        </CtaLink>
      </div>
    </section>
  );
}
