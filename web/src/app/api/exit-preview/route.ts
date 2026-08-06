import { draftMode, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { DRAFT_KEY_COOKIE } from "../preview/constants";

// プレビュー（Draft Mode）を終了して元のページに戻る
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const cookieStore = await cookies();
  cookieStore.delete(DRAFT_KEY_COOKIE);

  // 戻り先はサイト内パスのみ許可する（オープンリダイレクト対策）。
  // バックスラッシュはブラウザが "/" に正規化し "//host" になり得るため拒否する
  const redirectTo = request.nextUrl.searchParams.get("redirect");
  const safePath =
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//") &&
    !redirectTo.includes("\\")
      ? redirectTo
      : "/";
  redirect(safePath);
}
