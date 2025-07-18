import { AuthorProps } from "@/interfaces/common";
import { formatDate } from "@/libs/utils";
import Image from "next/image";

const defaultAuthor = {
    image: "/sindi.png",
    name: "AI講師 シンディ",
}

export default function Author({postDate, author}: {postDate: string, author: AuthorProps}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#289B8F]">
        <Image
          src={author.image.url || defaultAuthor.image}
          alt={author.name || defaultAuthor.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span
          className="font-semibold text-[#000]"
          style={{ fontFamily: "Noto Sans JP, sans-serif" }}
        >
          {author.name || defaultAuthor.name}
        </span>
        <time
          className="text-sm text-gray-600"
          style={{ fontFamily: "Noto Sans JP, sans-serif" }}
        >
          {formatDate(postDate)}
        </time>
      </div>
    </div>
  );
}
