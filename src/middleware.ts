import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  let session;
  if(sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch(e) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  const { pathname } = request.nextUrl;
  const isPublicPage = ['/about', '/terms', '/privacy', '/login', '/signup'].some(page => pathname.startsWith(page));
  const isHomePage = pathname === '/';

  // If a logged-in user tries to access a public page (like login) or the home page, redirect them.
  // We exclude this check if the 'referer' is the login page itself, which prevents a redirect loop immediately after login.
  const referer = request.headers.get('referer');
  const isImmediatelyAfterLogin = referer && (new URL(referer).pathname === '/login');

  if (session && (isPublicPage || isHomePage) && !isImmediatelyAfterLogin) {
    const redirectUrl = session.role === 'admin' ? '/admin' : '/chat';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If an unauthenticated user tries to access a protected page, redirect to login
  if (!session && !isPublicPage && !isHomePage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect the admin route
  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
    // If a non-admin user tries to access /admin, send them to their chat.
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
