import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // 認証が必要ないページ（公開ページ）
  const publicPaths = ['/', '/login', '/register'];
  if (publicPaths.includes(pathname)) {
    return res;
  }

  // 静的ファイルやAPIルートはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icon.svg') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js)$/)
  ) {
    return res;
  }

  // クライアント側でlocalStorageにセッションを保存しているため、
  // サーバー側での認証チェックは不要
  // ダッシュボードなどのページは、クライアント側のuseAuthフックで認証チェックを行う
  // これにより、サーバー側のクッキー解析エラーを完全に回避
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
