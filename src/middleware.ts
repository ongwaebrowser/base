import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  let session;
  if(sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch(e) {
      // Invalid session cookie, delete it and proceed as unauthenticated
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  const { pathname } = request.nextUrl;
  const publicPages = ['/about', '/terms', '/privacy', '/login', '/signup'];

  const isPublicPage = publicPages.some(page => pathname.startsWith(page));

  // If a logged-in user tries to access the root, login, or signup, redirect them to their dashboard
  if (session && (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const redirectUrl = session.role === 'admin' ? '/admin' : '/chat';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If an unauthenticated user tries to access a protected page, redirect to login
  if (!session && pathname !== '/' && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect the admin route
  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Allow access to the landing page for anonymous users
  if (pathname === '/' && !session) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
