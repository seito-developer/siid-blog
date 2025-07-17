import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiiD BLOG",
  description: "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
  keywords: ["プログラミング", "エンジニア転職", "技術学習", "SiiD", "セイト先生", "ブログ"],
  authors: [{ name: "SiiD" }],
  creator: "SiiD",
  publisher: "SiiD",
  openGraph: {
    title: "SiiD BLOG",
    description: "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
    type: "website",
    locale: "ja_JP",
    siteName: "SiiD BLOG",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiiD BLOG",
    description: "YouTube登録者数12万人を誇るセイト先生が教える、プログラミングスクールSiiDのブログメディア。エンジニア転職や技術学習に関連する有益な情報を発信中！",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}

