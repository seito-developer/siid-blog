"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

// シェアボタン（Issue #68）。X / はてなブックマーク / LINE / URLコピー。
// デザインはモノトーン＋ホバーでティール（SNSブランドカラーでは塗らない）。
// アイコンボタンは aria-label 必須・タップターゲット44px（h-11 w-11）。

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function HatenaIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center font-bold ${className ?? ""}`}
    >
      B!
    </span>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 5.79 2 10.46c0 4.18 3.618 7.68 8.5 8.34.33.07.78.22.9.5.1.26.06.66.03.92l-.15.9c-.04.26-.21 1.04.91.57 1.12-.47 6.03-3.55 8.23-6.08C21.86 13.9 22 12.24 22 10.46 22 5.79 17.523 2 12 2ZM8.09 13.2H6.02a.53.53 0 0 1-.53-.53V8.6a.53.53 0 0 1 1.06 0v3.54h1.54a.53.53 0 0 1 0 1.06Zm2.07-.53a.53.53 0 0 1-1.06 0V8.6a.53.53 0 0 1 1.06 0v4.07Zm4.84 0a.53.53 0 0 1-.36.5.55.55 0 0 1-.17.03.53.53 0 0 1-.43-.21l-2.09-2.84v2.52a.53.53 0 0 1-1.06 0V8.6a.53.53 0 0 1 .36-.5.53.53 0 0 1 .6.18l2.09 2.84V8.6a.53.53 0 0 1 1.06 0v4.07Zm3.34-2.56a.53.53 0 0 1 0 1.06h-1.54v.97h1.54a.53.53 0 0 1 0 1.06h-2.07a.53.53 0 0 1-.53-.53V8.6a.53.53 0 0 1 .53-.53h2.07a.53.53 0 0 1 0 1.06h-1.54v.97h1.54Z" />
    </svg>
  );
}

const BTN_CLASS =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-[#289B8F] hover:bg-[#289B8F] hover:text-white";

export default function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`;
  const shareHatena = `https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(
    url
  )}&title=${encodeURIComponent(title)}`;
  const shareLine = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    url
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボード API 不可（非対応・権限拒否）の場合は無反応にとどめる
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-8">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-[#214a4a]">シェアする</span>
        <div className="flex items-center gap-2">
          <a
            href={shareX}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X（旧Twitter）でシェア"
            className={BTN_CLASS}
          >
            <XIcon className="h-4 w-4" />
          </a>
          <a
            href={shareHatena}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="はてなブックマークに追加"
            className={BTN_CLASS}
          >
            <HatenaIcon className="text-sm" />
          </a>
          <a
            href={shareLine}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LINE でシェア"
            className={BTN_CLASS}
          >
            <LineIcon className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "URL をコピーしました" : "URL をコピー"}
            className={BTN_CLASS}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden />
            )}
          </button>
          <span
            role="status"
            aria-live="polite"
            className={`text-xs text-[#289B8F] transition-opacity ${
              copied ? "opacity-100" : "opacity-0"
            }`}
          >
            コピーしました
          </span>
        </div>
      </div>
    </div>
  );
}
