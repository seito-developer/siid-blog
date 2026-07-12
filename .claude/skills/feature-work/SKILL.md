---
name: feature-work
description: GitHub Issue を起点に feature ブランチを切り、実装〜セルフレビュー〜PR 作成まで行う SiiD BLOG の標準開発フロー。ユーザーが「Issue #N やって」「次のタスク進めて」「feature-work」と言ったときに使う。
---

# feature-work: Issue 駆動の実装フロー

SiiD BLOG の標準フロー。詳細ルールは `docs/WORKFLOW.md` を参照。

## 手順

1. **Issue 確認**: `gh issue view <N>` で目的・完了条件を読む。関連する `docs/SPEC.md` の該当セクションを必ず読む
2. **ブランチ作成**: 最新 develop から切る
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feature/<N>-<slug>
   ```
   種別により `fix/` `docs/` `chore/` プレフィックスを使い分ける
3. **実装**:
   - 記事本文のレンダリングに触れる場合は**必ず** `sanitize-article-html` を通す（XSS hotfix 実績あり）
   - タグ・カテゴリ・サムネイル周りは MEMO.md / SPEC.md §9 の方針（タグ廃止・1記事1カテゴリ・サムネイルプリセット化）との整合を確認する
   - microCMS のデータ確認は microcms MCP サーバー（読み取り）か `curl` + `MICROCMS_API_KEY` を使う
4. **検証**: `verify-web` スキルに従う（lint / typecheck / test / build + ブラウザ確認）
5. **コミット & PR**:
   - コミットは `feat:` 等のプレフィックス付き
   - PR は develop 向け、本文冒頭に `Closes #<N>`、変更概要・確認方法・UI 変更ならスクリーンショットを記載
   - push 後は `git ls-remote origin <branch>` と `git rev-parse HEAD` の SHA 一致を確認してから完了報告する
6. **セルフレビュー**: PR 作成後にサブエージェントでコードレビューを実施し、指摘を修正して push
7. **完了報告**: PR URL をユーザーに共有し、**マージはユーザーに委ねる**（自動マージ禁止）。microCMS 管理画面や Vercel の手動設定が必要な場合は PR 本文に明記する

## 禁止事項

- develop / main への直接コミット・push
- lint / typecheck / test 未通過でのコミット
- Issue・仕様書を読まずに実装を始めること
- `Closes #<N>` は develop 向け PR では自動クローズされないことを忘れて放置すること（**コミットメッセージに** `Closes #<N>` を含めておけば、develop → main のリリースでコミットがデフォルトブランチに到達した時点で自動クローズされる。この慣習のためコミットメッセージにも必ず書く。リリース前にクローズしたい場合のみ手動で閉じる）
