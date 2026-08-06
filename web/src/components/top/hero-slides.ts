import { SIID_SITE_URL } from "@/app/links";

// ヒーローカルーセルのスライド設定（Issue #63）。
// 当面はコード内で管理する（microCMS 化は将来検討）。
// 外部リンクは CtaLink 経由で UTM 付与・GA4 送信する（ctaPosition="hero"）。

export type HeroSlide = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  baseUrl: string;
  ctaType: string; // service / benefit / campaign
  ctaLabel: string;
  // 背景（画像が無いスライドのテキスト構成用）
  bgClassName: string;
  enabled: boolean;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "service",
    title: "未経験からのエンジニア転職なら SiiD",
    description:
      "YouTube 13万人のセイト先生が主任講師。AIを活用した実践カリキュラムで最短キャリアチェンジ。",
    imageSrc: "/banner-1.png",
    imageAlt: "AIプログラミングスクール SiiD",
    baseUrl: SIID_SITE_URL,
    ctaType: "service",
    ctaLabel: "SiiD を見てみる",
    bgClassName: "bg-gradient-to-r from-[#214a4a] to-[#289B8F]",
    enabled: true,
  },
  {
    id: "benefit",
    // TODO(owner): 給付金（Reスキル認定講座）解説記事の公開後、実 URL と訴求文へ差し替える。
    // 記事未執筆のため暫定でサービスサイトへ誘導（オーナー確認済み・プレースホルダー）。
    title: "最大70%の給付金でお得に受講",
    description:
      "経済産業省リスキリング（Reスキル）認定講座。対象者は受講料の大部分が給付対象に。",
    imageSrc: "/banner-1.png",
    imageAlt: "給付金でお得に受講できる SiiD",
    baseUrl: SIID_SITE_URL,
    ctaType: "benefit",
    ctaLabel: "給付金について知る",
    bgClassName: "bg-gradient-to-r from-[#1f3d5c] to-[#289B8F]",
    enabled: true,
  },
  {
    id: "campaign",
    // TODO(owner): キャンペーン実施時に内容を設定し enabled: true にする。
    title: "期間限定キャンペーン実施中",
    description: "今だけの特典をご用意しています。詳しくは公式サイトをご覧ください。",
    imageSrc: "/banner-1.png",
    imageAlt: "SiiD 期間限定キャンペーン",
    baseUrl: SIID_SITE_URL,
    ctaType: "campaign",
    ctaLabel: "キャンペーン詳細",
    bgClassName: "bg-gradient-to-r from-[#214a4a] to-[#3a6b6b]",
    enabled: false,
  },
];

// 表示対象（enabled）のスライドだけを返す。
export function getEnabledHeroSlides(): HeroSlide[] {
  return HERO_SLIDES.filter((slide) => slide.enabled);
}
