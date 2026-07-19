"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ListTree } from "lucide-react";
import type { TocItem } from "@/libs/article-content";

// 目次（Issue #67）。本文の h2 / h3 から生成した見出し一覧を受け取る。
// - variant="desktop": PC サイドバー上部に sticky 配置、現在地見出しをハイライト
// - variant="mobile": SP 本文冒頭に折りたたみ（details）
// スムーススクロールは prefers-reduced-motion で無効化する。

type Props = {
  headings: TocItem[];
  variant: "desktop" | "mobile";
  className?: string;
};

// 現在ビューポート上部に最も近い見出しを active とする（IntersectionObserver）
function useActiveHeading(headings: TocItem[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  // 現在交差中の見出しを保持（DOM 順で先頭を active にする）
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const order = headings.map((h) => h.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.current.add(entry.target.id);
          } else {
            visible.current.delete(entry.target.id);
          }
        }
        // 交差中の見出しのうち DOM 順で最初のものを active にする
        const firstVisible = order.find((id) => visible.current.has(id));
        if (firstVisible) {
          setActiveId(firstVisible);
        }
      },
      // ヘッダー(h-16)分を上に見て、見出しが上端付近に来たら active 化
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function handleTocClick(
  e: MouseEvent<HTMLAnchorElement>,
  id: string
) {
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });
  // ハッシュを更新（履歴は汚さない）。scrollIntoView と二重スクロールしないよう replaceState
  history.replaceState(null, "", `#${id}`);
}

function TocList({
  headings,
  activeId,
}: {
  headings: TocItem[];
  activeId: string | null;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {headings.map((h) => {
        const isActive = h.id === activeId;
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleTocClick(e, h.id)}
              aria-current={isActive ? "location" : undefined}
              className={[
                "block border-l-2 py-1 transition-colors",
                h.level === 3 ? "pl-6" : "pl-3",
                isActive
                  ? "border-[#289B8F] font-medium text-[#214a4a]"
                  : "border-transparent text-gray-500 hover:text-[#214a4a]",
              ].join(" ")}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function ArticleToc({ headings, variant, className }: Props) {
  const activeId = useActiveHeading(headings);

  if (headings.length === 0) {
    return null;
  }

  if (variant === "mobile") {
    return (
      <details className={`rounded-xl border border-gray-200 bg-white ${className ?? ""}`}>
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-bold text-[#214a4a] marker:content-none">
          <ListTree className="h-5 w-5" aria-hidden />
          目次
        </summary>
        <nav aria-label="目次" className="border-t border-gray-100 px-4 py-3">
          <TocList headings={headings} activeId={activeId} />
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="目次" className={className}>
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#214a4a]">
        <ListTree className="h-4 w-4" aria-hidden />
        目次
      </p>
      <TocList headings={headings} activeId={activeId} />
    </nav>
  );
}
