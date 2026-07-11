// JSON-LD 構造化データを出力する。
// CMS 由来の文字列が </script> でタグを閉じられないよう "<" をエスケープする
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
