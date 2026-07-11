import { draftMode, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { BLOG_API_BASE, BLOG_API_ENDPOINT } from "@/app/constants";
import { DRAFT_KEY_COOKIE } from "./constants";

// microCMS の「画面プレビュー」の受け口。
// microCMS 管理画面 > blog API > API 設定 > 画面プレビュー に
// https://<ドメイン>/api/preview?slug={CONTENT_ID}&draftKey={DRAFT_KEY}
// を設定すると、記事編集画面の「Page Preview」からここに飛んでくる。
// draftKey を microCMS に照会して正当性を検証してから Draft Mode を
// 有効化し、記事ページへリダイレクトする。

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const draftKey = request.nextUrl.searchParams.get("draftKey");

  // microCMS のコンテンツ ID 形式のみ許可する（"#" や "/" 等を混ぜて
  // 検証用リクエストの URL を改変されないように）
  if (!slug || !/^[A-Za-z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ message: "invalid slug" }, { status: 400 });
  }

  // 公開済み記事のプレビュー（下書きが無い場合 draftKey は空）は
  // そのまま公開ページへ
  if (!draftKey) {
    redirect(`/blog/${slug}`);
  }

  if (!process.env.MICROCMS_API_KEY) {
    return NextResponse.json(
      { message: "MICROCMS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // draftKey の正当性を microCMS への問い合わせで検証する
  // （不正なキーで Draft Mode を有効化させない）
  const url = `${BLOG_API_BASE}/${BLOG_API_ENDPOINT}/${slug}?draftKey=${encodeURIComponent(
    draftKey
  )}&fields=id`;
  const res = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY },
    cache: "no-store",
  });
  // 上流障害（5xx）は認証失敗と区別して返す（障害時の切り分けのため）
  if (res.status >= 500) {
    return NextResponse.json(
      { message: "microCMS is unavailable" },
      { status: 502 }
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      { message: "Invalid slug or draftKey" },
      { status: 401 }
    );
  }

  const draft = await draftMode();
  draft.enable();

  // 記事ページのフェッチで使う draftKey を httpOnly Cookie に保持する
  const cookieStore = await cookies();
  cookieStore.set(DRAFT_KEY_COOKIE, draftKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect(`/blog/${slug}`);
}
