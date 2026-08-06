import { Youtube } from "lucide-react";
import CtaLink from "@/components/cta-link";
import { YOUTUBE_SEITO_URL, YOUTUBE_SIID_URL } from "@/app/links";

// YouTube セクション（Issue #65）。2チャンネルへの導線。
// URL は実値（links.ts）。サムネイル・登録者数は暫定表示。
// TODO(owner): 各チャンネルのサムネイル画像・正確な登録者数を差し替える。

type Channel = {
  id: string;
  name: string;
  handle: string;
  subscribers: string; // 表示用（暫定）
  url: string;
  ctaType: string;
};

const CHANNELS: Channel[] = [
  {
    id: "seito",
    name: "セイト先生 by AIプログラミングスクールSiiD",
    handle: "@webit7652",
    subscribers: "登録者 約13万人",
    url: YOUTUBE_SEITO_URL,
    ctaType: "youtube_seito",
  },
  {
    id: "siid",
    name: "AIプログラミングスクールSiiD",
    handle: "@programming-siid",
    subscribers: "登録者数を確認中",
    url: YOUTUBE_SIID_URL,
    ctaType: "youtube_siid",
  },
];

export default function YouTubeSection() {
  return (
    <section aria-labelledby="youtube-heading" className="py-4">
      <h2 id="youtube-heading" className="mb-6 text-2xl font-bold text-[#214a4a]">
        YouTube でも学べる
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {CHANNELS.map((ch) => (
          <div
            key={ch.id}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
          >
            {/* サムネイル（TODO(owner): 実サムネイルに差し替え） */}
            <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-[#214a4a] sm:h-24 sm:w-40">
              <Youtube className="h-12 w-12 text-white" aria-hidden />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="font-bold text-[#214a4a]">{ch.name}</h3>
              <p className="text-xs text-gray-500">
                {ch.handle}・{ch.subscribers}
              </p>
              <CtaLink
                baseUrl={ch.url}
                ctaType={ch.ctaType}
                ctaPosition="top_youtube"
                articleSlug="top"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#FF0000] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
              >
                <Youtube className="h-4 w-4" />
                チャンネルを見る
              </CtaLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
