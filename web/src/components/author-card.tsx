import Image from "next/image";
import { Youtube, User } from "lucide-react";
import { AuthorProps } from "@/interfaces/common";
import { isAiAuthor, isSeitoAuthor } from "@/libs/author";
import { X_URL, YOUTUBE_SEITO_URL } from "@/app/links";

// 「この記事を書いた人」カード（Issue #58）。
// AI 著者シンディの場合は AI アシスタントであることを明示する（Issue #60）
export default function AuthorCard({ author }: { author: AuthorProps }) {
  const isAi = isAiAuthor(author);
  const imageUrl = author.image?.url || (isAi ? "/sindi.png" : null);
  // SNS はセイト先生本人・AI（運営）著者にのみ表示する。
  // 未知の実在著者に他人（セイト先生）の SNS を出して誤認させない
  const showSocial = isSeitoAuthor(author) || isAi;

  return (
    <section className="max-w-4xl mx-auto px-6 pb-10">
      <div className="rounded-2xl bg-white shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-[#214a4a] mb-5">
          この記事を書いた人
        </h2>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-[#289B8F] bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <User
                className="w-full h-full p-4 text-gray-400"
                aria-hidden
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-bold text-[#214a4a]">
              {author.name}
              {isAi && (
                <span className="rounded-full bg-[#214a4a] px-2.5 py-0.5 text-xs font-medium text-white">
                  AIアシスタント
                </span>
              )}
            </p>
            {author.description ? (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {author.description}
              </p>
            ) : (
              // description が無い AI 著者向けの説明文（重複を避けるため description があれば出さない）
              isAi && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  プログラミングスクール SiiD が運営する AIアシスタント著者です。
                  記事は SiiD 運営チームの確認のもとで公開しています。
                </p>
              )
            )}
            {showSocial && (
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <a
                  href={YOUTUBE_SEITO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#214a4a] underline hover:text-[#289B8F]"
                >
                  <Youtube className="w-4 h-4" aria-hidden />
                  YouTube（セイト先生）
                </a>
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#214a4a] underline hover:text-[#289B8F]"
                >
                  <span className="font-bold" aria-hidden>
                    𝕏
                  </span>
                  X（旧Twitter）
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
