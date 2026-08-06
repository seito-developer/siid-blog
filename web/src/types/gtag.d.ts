// GA4 の gtag をクライアントコンポーネントから型安全に呼ぶための共有宣言。
// google-analytics-page-view.tsx / cta-link.tsx などが参照する。
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export {};
