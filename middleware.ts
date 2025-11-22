import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/types/database';

export async function middleware(request: NextRequest) {
  try {
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

    // 環境変数が設定されていない場合は認証チェックをスキップ（開発環境用）
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase環境変数が設定されていません。認証チェックをスキップします。');
      return res;
    }

    const supabase = createMiddlewareClient<Database>({ req: request, res });

    let session = null;
    let error = null;
    
    try {
      const result = await supabase.auth.getSession();
      session = result.data?.session || null;
      error = result.error || null;
    } catch (err) {
      // クッキー解析エラーなどの例外を無視
      // クライアント側でlocalStorageにセッションを保存している場合、
      // サーバー側のクッキーにセッションがないことが正常な状態
      error = err as any;
    }

    // セッション取得エラーまたはセッションがない場合はスキップ
    // クライアント側でlocalStorageにセッションを保存している場合、
    // サーバー側のクッキーにセッションがないことが正常な状態
    if (error || !session) {
      // 認証が必要なページの場合でも、クライアント側でセッション管理しているため
      // サーバー側でリダイレクトしない（クライアント側でリダイレクトする）
      // ただし、明確に認証が必要なAPIエンドポイントなどは除外
      if (
        pathname.startsWith('/api/') && 
        !pathname.startsWith('/api/auth/')
      ) {
        // APIエンドポイントでセッションが必要な場合はリダイレクト
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      // ダッシュボードなどのページはクライアント側で認証チェックするため、ここではリダイレクトしない
      return res;
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
  } catch (error) {
    // エラーが発生した場合は、ログを出力してリクエストを続行
    console.error('Middleware error:', error);
    // エラー時は認証チェックをスキップしてリクエストを続行
    return NextResponse.next();
  }
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
