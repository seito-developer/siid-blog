import { Youtube } from "lucide-react";
import CtaLink from "./cta-link";
import { YOUTUBE_SEITO_URL, YOUTUBE_SIID_URL } from "@/app/links";

// 記事詳細の YouTube ウィジェット（Issue #66）。2チャンネルへの導線。
// PC はサイドバー（variant="sidebar"）、SP は本文末に縦積み（variant="stacked"）。
// UTM 付与・GA4 送信は CtaLink に集約。

type Channel = {
  id: string;
  name: string;
  url: string;
  ctaType: string;
};

const CHANNELS: Channel[] = [
  {
    id: "seito",
    name: "セイト先生の Web 制作・プログラミング",
    url: YOUTUBE_SEITO_URL,
    ctaType: "youtube_seito",
  },
  {
    id: "siid",
    name: "SiiD プログラミングスクール",
    url: YOUTUBE_SIID_URL,
    ctaType: "youtube_siid",
  },
];

export default function SidebarYouTube({
  slug,
  variant = "sidebar",
}: {
  slug: string;
  variant?: "sidebar" | "stacked";
}) {
  const position = variant === "sidebar" ? "sidebar_youtube" : "article_youtube";

  return (
    <section aria-label="YouTube チャンネル">
      <h2 className="mb-3 text-base font-bold text-[#214a4a]">YouTube でも学べる</h2>
      <ul className="space-y-2.5">
        {CHANNELS.map((ch) => (
          <li key={ch.id}>
            <CtaLink
              baseUrl={ch.url}
              ctaType={ch.ctaType}
              ctaPosition={position}
              articleSlug={slug}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-[#289B8F]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF0000] text-white">
                <Youtube className="h-5 w-5" aria-hidden />
              </span>
              <span className="line-clamp-2 text-sm font-medium text-gray-700">
                {ch.name}
              </span>
            </CtaLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
