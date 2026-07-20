import Image from "next/image";
import { User } from "lucide-react";
import { AuthorProps } from "@/interfaces/common";
import { isAiAuthor } from "@/libs/author";

// 「この記事を書いた人」カード（Issue #58）。
// AI 著者シンディの場合は AI アシスタントであることを明示する（Issue #60）
export default function AuthorCard({ author }: { author: AuthorProps }) {
  const isAi = isAiAuthor(author);
  const imageUrl = author.image?.url || (isAi ? "/editors.png" : null);

  return (
    <section className="max-w-4xl mx-auto px-6 lg:px-0 pb-10">
      <div className="rounded-2xl bg-white shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-[#214a4a] mb-5">
          この記事を書いた人
        </h2>
        <div className="flex sm:flex-row gap-5">
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
              <User className="w-full h-full p-4 text-gray-400" aria-hidden />
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
          </div>
        </div>
      </div>
    </section>
  );
}
