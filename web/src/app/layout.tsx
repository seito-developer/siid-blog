import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Footer from "@/components/footer";
import GoogleAnalytics from "@/components/google-analytics";
import JsonLd from "@/components/json-ld";
import { DEFAULT_OGP_IMAGE, SITE_URL } from "./constants";
import { SIID_SITE_URL, X_URL, YOUTUBE_SEITO_URL, YOUTUBE_SIID_URL } from "./links";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SiiD BLOG",
  description:
    "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
  authors: [{ name: "SiiD" }],
  creator: "SiiD",
  publisher: "SiiD",
  openGraph: {
    title: "SiiD BLOG",
    description:
      "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
    type: "website",
    locale: "ja_JP",
    siteName: "SiiD BLOG",
    url: SITE_URL,
    // 相対パスは metadataBase で絶対 URL 化される
    images: [{ url: DEFAULT_OGP_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SiiD BLOG",
    description:
      "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
    images: [DEFAULT_OGP_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// 運営組織の JSON-LD（Issue #59）。全ページに出力し、記事の publisher /
// AI 著者記事の author からは @id で参照する（blog/[slug]/page.tsx）
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "SiiD",
  url: SIID_SITE_URL,
  // 専用ロゴ画像が未整備のためサイト共通 OGP 画像を暫定使用。用意でき次第差し替える
  logo: `${SITE_URL}${DEFAULT_OGP_IMAGE}`,
  sameAs: [YOUTUBE_SEITO_URL, YOUTUBE_SIID_URL, X_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <JsonLd data={organizationJsonLd} />
        {children}
        <Footer />
      </body>
    </html>
  );
}

