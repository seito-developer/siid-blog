import { CalendarCheck } from "lucide-react";
import CtaLink from "./cta-link";
import { COUNSELING_URL } from "@/app/links";

// サイドバーの CV ウィジェット（Issue #66）。
// 無料個別面談 / 資料請求 / 公式LINE の3導線。UTM 付与・GA4 送信は CtaLink に集約。
// 資料請求・公式LINE は暫定 URL（links.ts の TODO(owner) 参照）。

const CTA_POSITION = "sidebar";

const BUTTONS = [
  {
    label: "SiiDの詳細を見る",
    baseUrl: COUNSELING_URL,
    ctaType: "counseling",
    Icon: CalendarCheck,
    primary: true,
  },
  // {
  //   label: "資料請求",
  //   baseUrl: DOCUMENT_URL,
  //   ctaType: "document",
  //   Icon: FileText,
  //   primary: false,
  // },
  // {
  //   label: "公式LINE",
  //   baseUrl: LINE_URL,
  //   ctaType: "line",
  //   Icon: MessageCircle,
  //   primary: false,
  // },
];

export default function CvWidget({ slug }: { slug: string }) {
  return (
    <section
      aria-label="SiiD への相談"
      className="rounded-2xl bg-[#214a4a] p-5 text-white"
    >
      <p className="text-base font-bold">エンジニア転職の相談はこちら</p>
      <p className="mt-2 text-xs leading-relaxed text-white/80">
        現役エンジニア＆元人事のプロが、あなたの状況に合わせて無料でご案内します。
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        {BUTTONS.map(({ label, baseUrl, ctaType, Icon, primary }) => (
          <CtaLink
            key={ctaType}
            baseUrl={baseUrl}
            ctaType={ctaType}
            ctaPosition={CTA_POSITION}
            articleSlug={slug}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-opacity hover:opacity-85",
              primary
                ? "bg-white text-[#214a4a]"
                : "border border-white/40 bg-transparent text-white",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </CtaLink>
        ))}
      </div>
    </section>
  );
}
