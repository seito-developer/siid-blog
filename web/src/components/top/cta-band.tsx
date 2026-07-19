import CtaCard from "@/components/cta-card";

// TOP のスクール紹介 CTA（Issue #65 / #77）。
// 記事末 CTA とデザイン・コピーを統一するため共通の CtaCard を使用する。
// 計測位置は cta_band のまま維持する。
export default function CtaBand() {
  return (
    <section aria-label="スクール紹介" className="py-4">
      <CtaCard articleSlug="top" ctaPosition="cta_band" />
    </section>
  );
}
