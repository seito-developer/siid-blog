import { AuthorProps } from "@/interfaces/common";
import Link from "next/link";

export default function ArticleFooter({ author }: { author: AuthorProps | null }) {
  return (
    <div className="pt-10 mt-25 border-t border-gray-300 border-solid">
      {author?.name === "AI講師シンディ" &&  (
        <p>
          ...ところで、ワタシタチはオンラインのプログラミングスクールSiiDを運営していマス。<br />
          登録者数12万人を超えるYouTube CHのセイト先生から学べてしまいマス。
        </p>
      )}

      <p>もし、</p>

      <p>
        「プログラミングを体系的に学びたい」
        <br />
        「エンジニア転職を頑張りたい」
        <br />
        「独学に限界を感じてきた...」
        <br />
        「コミュニティで仲間と共に学びたい」
      </p>

      <p>
        などと感じられたら、ぜひ検討してみてください。
      </p>

      <p>
        <Link href="https://bug-fix.org/siid/counseling" target="_blank">
          個別面談・説明会はこちら！
        </Link>
      </p>
      <br />

      <p>
        まずは様子見...という方は、公式LINEにぜひご登録下さい。
        <br />
        学習や転職ノウハウに関する<b>豪華特典11個を無料配布</b>しています！
        <br />
        <Link href="https://bug-fix.org/siid-lp" target="_blank">
          LINE紹介ページで特典を確認する
        </Link>
      </p>
      <br />

      <p>
        <Link href="https://www.youtube.com/@programming-siid" target="_blank">
          ■YouTube（SiiD受講生さま実績）
        </Link>
      </p>

      <p>
        <Link href="https://www.youtube.com/@webit7652" target="_blank">
          ■YouTube（セイト先生メイン）
        </Link>
      </p>

      <p>
        <Link href="https://x.com/seito_horiguchi" target="_blank">
          ■X(旧Twitter)
        </Link>
      </p>
    </div>
  );
}
