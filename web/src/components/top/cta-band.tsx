import { MessageCircle, FileText, CalendarCheck } from "lucide-react";
import CtaLink from "@/components/cta-link";
import { COUNSELING_URL, DOCUMENT_URL, LINE_URL } from "@/app/links";

// スクール紹介 CTA 帯（Issue #65）。深緑背景・3 ボタン。
// UTM 付与・GA4 送信は CtaLink（docs/ANALYTICS.md）に集約。
// 資料請求・公式LINE は暫定 URL（links.ts の TODO(owner) 参照）。

const CTA_POSITION = "cta_band";

const BUTTONS = [
  {
    label: "無料個別面談",
    baseUrl: COUNSELING_URL,
    ctaType: "counseling",
    Icon: CalendarCheck,
  },
  {
    label: "資料請求",
    baseUrl: DOCUMENT_URL,
    ctaType: "document",
    Icon: FileText,
  },
  {
    label: "公式LINE",
    baseUrl: LINE_URL,
    ctaType: "line",
    Icon: MessageCircle,
  },
];

export default function CtaBand() {
  return (
    <section aria-labelledby="cta-band-heading" className="py-4">
      <div className="rounded-2xl bg-[#214a4a] px-6 py-10 text-center text-white sm:px-10">
        <h2 id="cta-band-heading" className="text-2xl font-bold">
          AIプログラミングスクール「SiiD」
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          未経験からのエンジニア転職を、現役エンジニア＆元人事のプロが伴走。
          まずはお気軽にご相談ください。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {BUTTONS.map(({ label, baseUrl, ctaType, Icon }) => (
            <CtaLink
              key={ctaType}
              baseUrl={baseUrl}
              ctaType={ctaType}
              ctaPosition={CTA_POSITION}
              articleSlug="top"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#214a4a] transition-opacity hover:opacity-85 sm:w-auto sm:min-w-44"
            >
              <Icon className="h-4 w-4" />
              {label}
            </CtaLink>
          ))}
        </div>
      </div>
    </section>
  );
}
