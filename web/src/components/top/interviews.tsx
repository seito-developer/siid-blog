import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 受講生インタビューセクション（Issue #64）。
// TODO(owner): 実際のインタビュー記事が用意でき次第、下記 INTERVIEWS を
//   実データ（記事 URL・受講生名・職種・写真）に差し替える。
//   識別方法（カテゴリ or 専用フィールド）が決まればそれに応じて microCMS 取得へ変更する。
//   データが空（INTERVIEWS = []）の場合はセクション自体が非表示になる。

export type Interview = {
  id: string;
  name: string;
  beforeJob: string; // 受講前の職種
  afterJob: string; // 受講後の職種
  comment: string;
  imageSrc: string;
  href: string;
};

// プレースホルダー（オーナー確認済み・本番前に差し替え）
export const INTERVIEWS: Interview[] = [
  {
    id: "placeholder-1",
    name: "受講生 A さん",
    beforeJob: "販売職",
    afterJob: "フロントエンドエンジニア",
    comment: "未経験から半年でWeb系企業へ転職できました。",
    imageSrc: "/editors.png",
    href: "#",
  },
  {
    id: "placeholder-2",
    name: "受講生 B さん",
    beforeJob: "事務職",
    afterJob: "バックエンドエンジニア",
    comment: "働きながらでも無理なく学習を続けられました。",
    imageSrc: "/editors.png",
    href: "#",
  },
  {
    id: "placeholder-3",
    name: "受講生 C さん",
    beforeJob: "営業職",
    afterJob: "社内SE",
    comment: "AI活用の学習法で効率よくスキルが身につきました。",
    imageSrc: "/editors.png",
    href: "#",
  },
];

function JobBadge({ label, tone }: { label: string; tone: "before" | "after" }) {
  const cls =
    tone === "before"
      ? "bg-gray-100 text-gray-600"
      : "bg-[#289B8F]/10 text-[#214a4a]";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function Interviews() {
  if (INTERVIEWS.length === 0) return null;

  return (
    <section aria-labelledby="interviews-heading" className="py-4">
      <h2
        id="interviews-heading"
        className="mb-6 text-2xl font-bold text-[#214a4a]"
      >
        受講生インタビュー
      </h2>
      {/* SP は横スクロール、PC は3カラム */}
      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {INTERVIEWS.map((iv) => (
          <Link
            key={iv.id}
            href={iv.href}
            className="group flex w-72 shrink-0 flex-col rounded-2xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:w-auto"
          >
            <div className="flex items-center gap-3">
              <Image
                src={iv.imageSrc}
                alt={iv.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-[#214a4a]">{iv.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <JobBadge label={iv.beforeJob} tone="before" />
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <JobBadge label={iv.afterJob} tone="after" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              {iv.comment}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
