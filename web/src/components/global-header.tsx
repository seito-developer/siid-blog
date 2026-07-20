"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { CATEGORIES } from "@/app/category/categories";
import { COUNSELING_URL } from "@/app/links";
import CtaLink from "@/components/cta-link";

// グローバルヘッダー（Issue #62）。全ページ共通・sticky。
// ロゴ / カテゴリ4リンク / 検索 / 「無料で相談する」CTA。
// SP はハンバーガー → ドロワー（フォーカストラップ・Esc閉じ・背景スクロールロック）。
// CTA の UTM 付与・GA4 送信は CtaLink（docs/ANALYTICS.md）に集約。

// ロゴは h1 にしない（各ページの h1 と競合させないため）
function Logo() {
  return (
    <Link
      href="/"
      className="text-xl font-bold tracking-tight text-[#214a4a]"
      aria-label="SiiD BLOG トップへ"
    >
      SiiD BLOG
    </Link>
  );
}

// ヘッダー CTA（PC・SP 共通で使い回す）
function HeaderCta({ className }: { className?: string }) {
  return (
    <CtaLink
      baseUrl={COUNSELING_URL}
      ctaType="counseling"
      ctaPosition="header"
      articleSlug="top"
      className={className}
    >
      SiiD無料カウンセリング
    </CtaLink>
  );
}

export default function GlobalHeader() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setSearchOpen(false);
    setDrawerOpen(false);
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Logo />

        {/* PC ナビ */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="カテゴリナビゲーション"
        >
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-[#289B8F]"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {/* PC 右側: 検索 + CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="記事を検索"
            aria-expanded={searchOpen}
            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#214a4a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#289B8F]"
          >
            <Search className="h-5 w-5" />
          </button>
          <HeaderCta className="inline-flex items-center rounded-full bg-[#289B8F] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#214a4a]" />
        </div>

        {/* SP 右側: CTA(小) + ハンバーガー */}
        <div className="flex items-center gap-2 md:hidden">
          <HeaderCta className="inline-flex items-center rounded-full bg-[#289B8F] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#214a4a]" />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="メニューを開く"
            className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#289B8F]"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* PC インライン検索バー */}
      {searchOpen && (
        <div className="hidden border-t border-gray-200 bg-white md:block">
          <form
            onSubmit={submitSearch}
            className="container mx-auto flex items-center gap-2 px-4 py-3"
            role="search"
          >
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="記事を検索..."
              aria-label="検索キーワード"
              className="flex-1 border-none bg-transparent py-1 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-[#289B8F] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#214a4a]"
            >
              検索
            </button>
          </form>
        </div>
      )}
      </header>

      {/* ドロワーは header の外に置く。header は backdrop-filter を持つため、
          内側に置くと position: fixed の包含ブロックが header になり
          ドロワーが header の高さ（64px）にクリップされてしまう */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSubmitSearch={submitSearch}
      />
    </>
  );
}

// SP ドロワー。フォーカストラップ・Esc閉じ・背景スクロールロック・
// オーバーレイクリックで閉じる（Issue #62 のアクセシビリティ要件）。
function MobileDrawer({
  open,
  onClose,
  searchTerm,
  onSearchTermChange,
  onSubmitSearch,
}: {
  open: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  onSubmitSearch: (e: React.FormEvent) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // フォーカストラップ: パネル内の可視フォーカス要素を巡回させる
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    // 背景スクロールロック + 開いた時のフォーカス移動 + 閉じた時の復帰
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    // パネル内の最初のフォーカス可能要素へ
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input'
    );
    firstFocusable?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="md:hidden" role="dialog" aria-modal="true" aria-label="メニュー">
      {/* オーバーレイ */}
      <button
        type="button"
        aria-label="メニューを閉じる"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40"
      />
      {/* パネル */}
      <div
        ref={panelRef}
        onKeyDown={handleKeyDown}
        className="fixed inset-y-0 right-0 z-50 flex w-4/5 max-w-xs flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <span className="text-lg font-bold text-[#214a4a]">メニュー</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="メニューを閉じる"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#289B8F]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmitSearch} role="search" className="border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="記事を検索..."
              aria-label="検索キーワード"
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
            />
          </div>
        </form>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4"
          aria-label="カテゴリナビゲーション"
        >
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              onClick={onClose}
              className="rounded-md px-4 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-gray-100 hover:text-[#289B8F]"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <HeaderCta className="flex w-full items-center justify-center rounded-full bg-[#289B8F] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#214a4a]" />
        </div>
      </div>
    </div>
  );
}
