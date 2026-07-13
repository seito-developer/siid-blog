import sanitizeHtml from "sanitize-html";

// 動画埋め込み（iframe）を許可する配信元。ここに無いホストの iframe は除去される
const ALLOWED_IFRAME_HOSTNAMES = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

// microCMS の画像は入稿原寸（幅1920px超もある）がそのまま配信されるため、
// 画像 API（imgix 互換）のパラメータで WebP 変換・リサイズして配信する
const MICROCMS_ASSETS_HOSTNAME = "images.microcms-assets.io";
const IMG_SRCSET_WIDTHS = [640, 960, 1280];
const IMG_DEFAULT_WIDTH = 1280;
// 本文は max-w-4xl(896px) - パディングで最大約 848px 表示
const IMG_SIZES = "(max-width: 896px) 100vw, 848px";

function withImageParams(src: string, width: number): string | undefined {
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("fm", "webp");
    url.searchParams.set("q", "75");
    return url.toString();
  } catch {
    return undefined;
  }
}

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "span",
      "div",
      "figure",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: [
        "src",
        "srcset",
        "sizes",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "decoding",
      ],
      iframe: [
        "src",
        "title",
        "allow",
        "allowfullscreen",
        "scrolling",
        "referrerpolicy",
        "loading",
      ],
      "*": ["class"],
    },
    // iframe は https の許可ホストのみ（src がこれ以外の iframe はタグごと除去）
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    allowedSchemesByTag: { iframe: ["https"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    disallowedTagsMode: "escape",
    // 許可ホスト外で src が除去された iframe（空タグ）と、
    // その結果空になった埋め込みラッパー div を丸ごと取り除く
    // （空 div が残ると記事内に無意味な余白ができるため）
    exclusiveFilter: (frame) =>
      (frame.tag === "iframe" && !frame.attribs.src) ||
      (frame.tag === "div" &&
        !frame.text.trim() &&
        frame.mediaChildren.length === 0),

    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isExternal = /^https?:\/\//i.test(href);

        const nextAttribs: Record<string, string> = { ...attribs };

        if (isExternal) {
          nextAttribs.target = "_blank";
          nextAttribs.rel = "noopener noreferrer";
        } else {
          if (nextAttribs.target) delete nextAttribs.target;
          if (nextAttribs.rel) delete nextAttribs.rel;
        }

        return { tagName, attribs: nextAttribs };
      },
      img: (tagName, attribs) => {
        const nextAttribs: Record<string, string> = {
          ...attribs,
          loading: "lazy",
          decoding: "async",
        };

        const src = attribs.src || "";
        let hostname = "";
        try {
          hostname = new URL(src).hostname;
        } catch {
          // 相対パス等はそのまま（最適化パラメータは付けない）
        }

        if (hostname === MICROCMS_ASSETS_HOSTNAME) {
          const defaultSrc = withImageParams(src, IMG_DEFAULT_WIDTH);
          if (defaultSrc) {
            nextAttribs.src = defaultSrc;
            nextAttribs.srcset = IMG_SRCSET_WIDTHS.map(
              (width) => `${withImageParams(src, width)} ${width}w`
            ).join(", ");
            nextAttribs.sizes = IMG_SIZES;
          }
        }

        return { tagName, attribs: nextAttribs };
      },
    },
  });
}
