
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  let session;
  if(sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch(e) {
      // Invalid session cookie
    }
  }


  const { pathname } = request.nextUrl;
  const publicPages = ['/about', '/terms', '/privacy'];

  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Allow access to the landing page for anonymous users
  if (!session && pathname === '/') {
    return NextResponse.next();
  }

  // If there's no session and the user is not on the login/signup/landing page, redirect to login
  if (!session && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session and the user tries to access login/signup, redirect to their dashboard
  if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const redirectUrl = session.role === 'admin' ? '/admin' : '/chat';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
   
   // If a logged-in user hits the root, redirect them to their dashboard
  if (session && pathname === '/') {
     const redirectUrl = session.role === 'admin' ? '/admin' : '/chat';
     return NextResponse.redirect(new URL(redirectUrl, request.url));
  }


  // Protect the admin route
  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  
  // Allow admins to access the main app too, but non-admins cannot access admin routes
  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
