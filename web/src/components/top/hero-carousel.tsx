"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CtaLink from "@/components/cta-link";
import { getEnabledHeroSlides } from "./hero-slides";

// ヒーローカルーセル（Issue #63）。
// - 矢印・ドットでスライド遷移
// - 自動再生（prefers-reduced-motion 時は無効化）
// - SP スワイプ対応
const AUTOPLAY_INTERVAL = 6000;

export default function HeroCarousel() {
  const slides = getEnabledHeroSlides();
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;
  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // prefers-reduced-motion を監視
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 自動再生（reduced-motion / 単一スライド時は無効）
  useEffect(() => {
    if (reducedMotion || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [reducedMotion, count]);

  if (count === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <section aria-roledescription="カルーセル" aria-label="お知らせ" className="relative">
      <div
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="スライド"
              aria-label={`${i + 1} / ${count}`}
              // 非アクティブスライドはフォーカス不可・a11yツリーから除外
              // （aria-hidden 内に focusable なリンクを残さない）
              inert={i !== index}
            >
              <CtaLink
                baseUrl={slide.baseUrl}
                ctaType={slide.ctaType}
                ctaPosition="hero"
                articleSlug="top"
                className={`relative flex min-h-[220px] flex-col items-start justify-center gap-3 px-6 py-8 text-white sm:min-h-[300px] sm:px-12 ${slide.bgClassName}`}
              >
                <h2 className="text-xl font-bold leading-snug sm:text-3xl">
                  {slide.title}
                </h2>
                <p className="max-w-2xl text-sm text-white/90 sm:text-base">
                  {slide.description}
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-bold text-[#214a4a]">
                  {slide.ctaLabel}
                </span>
                {/* 装飾画像（TODO(owner): 専用バナー素材が用意でき次第差し替え） */}
                <Image
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  width={160}
                  height={160}
                  className="pointer-events-none absolute right-4 bottom-4 hidden h-24 w-auto opacity-90 sm:block"
                  aria-hidden
                />
              </CtaLink>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="前のスライド"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white transition-colors hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="次のスライド"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white transition-colors hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="スライド選択">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1}番目のスライドへ`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#214a4a]" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
