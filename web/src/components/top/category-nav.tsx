import Link from "next/link";
import { Code2, Briefcase, TrendingUp, PenLine, type LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/app/category/categories";

// カテゴリ導線セクション（Issue #64）。
// 4カード・lucide-react アイコン。SP は 2×2。
// アイコンはカテゴリ slug に対応づける（未定義は既定アイコン）。
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  programming: Code2,
  career: Briefcase,
  marketing: TrendingUp,
  column: PenLine,
};

export default function CategoryNav() {
  if (CATEGORIES.length === 0) return null;

  return (
    <section aria-labelledby="category-nav-heading" className="py-4">
      <h2
        id="category-nav-heading"
        className="mb-6 text-2xl font-bold text-[#214a4a]"
      >
        カテゴリから探す
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.slug] ?? PenLine;
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#289B8F]/10 text-[#214a4a] transition-colors group-hover:bg-[#289B8F] group-hover:text-white">
                <Icon className="h-7 w-7" />
              </span>
              <span className="font-bold text-[#214a4a]">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
