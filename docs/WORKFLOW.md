# GitHub 運用フロー

SiiD BLOG の開発フロー・ブランチ戦略・PR ルールを定める（Issue #8）。

## ブランチ戦略

```
main ────────●───────────●──→  本番。push / マージで Vercel が自動デプロイ
              ↑           ↑
develop ──●──●──●──●──●──●──→  統合ブランチ。作業ブランチのマージ先
           ↑     ↑
feature/…──●     │             作業ブランチ。必ず develop から切る
fix/…────────────●
```

| ブランチ | 役割 | ルール |
|---|---|---|
| `main` | 本番（https://blog.bug-fix.org/） | 直接 push 禁止。**develop → main のリリースマージはオーナーのみが行う** |
| `develop` | 統合 | 直接 push 禁止。作業ブランチからの PR のみ受け付ける |
| 作業ブランチ | 個々の Issue の実装 | 最新の develop から切る。命名は下記 |

### 作業ブランチの命名

`<種別>/<Issue番号>-<内容のスラッグ>`

- `feature/7-category-page` — 機能追加
- `fix/5-html-lang` — バグ修正
- `docs/8-github-workflow` — ドキュメントのみ
- `chore/…` — 設定・依存更新など

## 開発の流れ

1. **Issue を確認**（無ければ作る）: 目的・完了条件を明確にする
2. **ブランチ作成**: `git checkout develop && git pull && git checkout -b <種別>/<N>-<slug>`
3. **実装**: コミットメッセージは Conventional Commits 風のプレフィックスを付ける
   - `feat:` 機能追加 / `fix:` バグ修正 / `docs:` ドキュメント / `chore:` その他 / `refactor:` / `test:`
4. **検証**: `cd web && npm run lint && npm run typecheck && npm test`。UI 変更は `npm run dev` でブラウザ確認、コード変更は `npm run build` の完走も確認
5. **PR 作成**: base は **develop**。テンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）に従い、冒頭に `Closes #<N>` を書く
6. **CI 通過を確認**: GitHub Actions（lint / typecheck / test）が緑になること
7. **マージ**: オーナーがレビューしてマージする（セルフマージは軽微な修正のみ可）

## PR ルール

- 1 PR = 1 Issue を原則とする（無関係な変更を混ぜない）
- 本文冒頭に `Closes #<N>`（develop 向け PR では自動クローズされないため、リリース時または手動でクローズする）
- 変更概要・確認方法を必ず記載。UI 変更はスクリーンショットを添付
- lint / typecheck / test が通らない PR はマージしない

## リリース

1. develop の内容を確認（必要ならプレビュー URL で動作確認）
2. **オーナーが** develop → main の PR を作成しマージ（または fast-forward）
3. Vercel が main を自動デプロイ
4. リリースに含まれる Issue をクローズする

## ブランチ保護（GitHub 設定）

Settings > Branches で以下を設定する:

| 対象 | 設定 |
|---|---|
| `main` | Require a pull request before merging / Require status checks to pass（CI: test）/ 直接 push 禁止 |
| `develop` | Require status checks to pass（CI: test）/ 直接 push 禁止（PR 経由のみ） |

※ 個人運用のため required approvals は 0 で運用する（レビューはオーナー自身のマージ判断で担保）。
