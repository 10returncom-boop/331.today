// Cloudflare Pages Middleware：www.331.today → 331.today 永久轉址（301）
// 目的：在不需 zone API 權限（dashboard 的 Redirect Rule）的前提下，
// 對所有掛在此 Pages 專案的自訂網域做 host 層級的 301。
// 其他網域（331.today、*.pages.dev）一律 pass-through，不影響既有靜態資源與 _headers 快取策略。

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.331.today') {
    return Response.redirect('https://331.today' + url.pathname + url.search, 301);
  }
  return context.next();
}
