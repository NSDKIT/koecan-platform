import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/types/database';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // 認証が必要ないページ（公開ページ）
  const publicPaths = ['/', '/login', '/register'];
  if (publicPaths.includes(pathname)) {
    return res;
  }

  // 認証が必要なページ
  if (!session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ユーザーのロールを取得（user_metadataから取得、なければデフォルトでmonitor）
  const role = (session.user.user_metadata?.role || 'monitor') as 'monitor' | 'client' | 'admin' | 'support';

  // ロールに応じたアクセス制御
  if (pathname.startsWith('/dashboard')) {
    if (role !== 'monitor') {
      // モニター以外はロールに応じたページにリダイレクト
      const redirectPath = role === 'admin' ? '/admin' : role === 'client' ? '/client' : role === 'support' ? '/support' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  } else if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      // 管理者以外はロールに応じたページにリダイレクト
      const redirectPath = role === 'monitor' ? '/dashboard' : role === 'client' ? '/client' : role === 'support' ? '/support' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  } else if (pathname.startsWith('/client')) {
    if (role !== 'client') {
      // 企業以外はロールに応じたページにリダイレクト
      const redirectPath = role === 'monitor' ? '/dashboard' : role === 'admin' ? '/admin' : role === 'support' ? '/support' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  } else if (pathname.startsWith('/support')) {
    if (role !== 'support') {
      // サポート以外はロールに応じたページにリダイレクト
      const redirectPath = role === 'monitor' ? '/dashboard' : role === 'admin' ? '/admin' : role === 'client' ? '/client' : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

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

