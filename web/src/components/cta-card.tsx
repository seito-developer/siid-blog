import CtaLink from "./cta-link";
import { COUNSELING_URL } from "@/app/links";

// スクール紹介 CTA カード（Issue #57 / #77）。
// 記事末（ArticleCtaCard）と TOP（CtaBand）で共通利用し、デザインを統一する。
// ユーザーを迷わせないよう無料個別面談の1導線に特化（レビュー反映）。
// UTM 付与・GA4 送信は CtaLink 側でまとめて行う（docs/ANALYTICS.md）。
// ctaPosition / articleSlug は設置箇所ごとに変えて計測を区別する。

export default function CtaCard({
  articleSlug,
  ctaPosition,
}: {
  articleSlug: string;
  ctaPosition: string;
}) {
  return (
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
        ctaPosition={ctaPosition}
        articleSlug={articleSlug}
        className="inline-block w-full sm:w-auto sm:min-w-80 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#214a4a] transition-opacity hover:opacity-85"
      >
        SiiDの詳細を見る
      </CtaLink>
    </div>
  );
}
