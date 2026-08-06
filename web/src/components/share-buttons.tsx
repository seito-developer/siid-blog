// シェアボタン（Issue #68）。X / Threads / LINE。
// デザインはモノトーン＋ホバーでティール（SNSブランドカラーでは塗らない）。
// アイコンボタンは aria-label 必須・タップターゲット44px（h-11 w-11）。
// いずれも外部インテント URL へのリンクのみのためサーバーコンポーネントで完結する。

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.166 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.629 5.8-2.045 1.646-1.615 1.616-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32l-1.696-1.14c.98-1.46 2.568-2.263 4.478-2.263h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.322.142 1.487.7 2.576 1.761 3.15 3.07.8 1.822.847 4.79-1.312 7.16C18.104 22.688 15.76 24 12.186 24Z" />
    </svg>
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
  const shareX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`;
  // Threads の Web インテントは url パラメータを持たないため、本文にタイトル＋URLを含める
  const shareThreads = `https://www.threads.net/intent/post?text=${encodeURIComponent(
    `${title} ${url}`
  )}`;
  const shareLine = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    url
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-0 pb-8">
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
            href={shareThreads}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads でシェア"
            className={BTN_CLASS}
          >
            <ThreadsIcon className="h-5 w-5" />
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
        </div>
      </div>
    </div>
  );
}
