import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません | SiiD BLOG",
  description: "お探しのページは見つかりませんでした。SiiD BLOGのホームページに戻って、他の記事をご覧ください。",
};

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>ページが見つかりませんでした</p>
    </main>
  );
}