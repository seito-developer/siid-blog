import { createHmac, timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BLOG_API_ENDPOINT } from "@/app/constants";

// microCMS の Webhook 受け口。記事の公開・更新・削除時に発火し、
// 該当記事の ISR キャッシュ（tags: ["blog-<id>"]）を再検証する。
// Webhook 設定手順: microCMS 管理画面 > API 設定 > Webhook で
// URL に https://<ドメイン>/api/revalidate、シークレットに
// MICROCMS_WEBHOOK_SECRET と同じ値を設定する。

// microCMS Webhook のペイロード（必要なフィールドのみ）
type MicroCMSWebhookBody = {
  api?: string;
  id?: string;
  type?: string;
};

// シークレットによる署名検証（HMAC-SHA256、タイミング攻撃対策込み）
function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.MICROCMS_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  return (
    expectedBuf.length === actualBuf.length &&
    timingSafeEqual(expectedBuf, actualBuf)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-microcms-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let body: MicroCMSWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  if (body.api !== BLOG_API_ENDPOINT || !body.id) {
    return NextResponse.json(
      { message: "Nothing to revalidate" },
      { status: 200 }
    );
  }

  const tag = `blog-${body.id}`;
  revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tag }, { status: 200 });
}
