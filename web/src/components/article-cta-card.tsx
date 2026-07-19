import CtaCard from "./cta-card";

// 記事末の CTA カード（Issue #57）。共通の CtaCard を記事末位置で使用する。
export default function ArticleCtaCard({ slug }: { slug: string }) {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-12">
      <CtaCard articleSlug={slug} ctaPosition="article_bottom" />
    </section>
  );
}
