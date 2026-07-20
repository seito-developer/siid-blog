import Image from "next/image";
import { User } from "lucide-react";
import { AuthorProps } from "@/interfaces/common";
import { isAiAuthor } from "@/libs/author";

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
            </p>
            {author.description ? (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {author.description}
              </p>
            ) : (
              // description が無い 著者向けの説明文（重複を避けるため description があれば出さない）
              isAi && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  SiiD BLOG編集部にて、皆さんの学習やキャリアに役立つ記事を発信します！ <br/>
                  普段は受講生の皆さん向けに、学習やキャリアの相談にのったりもしています。
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
