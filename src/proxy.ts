import { NextResponse, type NextRequest } from 'next/server';
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value;
  const isLoggedIn = !!sessionToken;
  const isPublic =
    pathname.startsWith('/login') || pathname.startsWith('/register');
  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
