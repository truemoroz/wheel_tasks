import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getPreferredLocale } from './i18n/detectLocale';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const LOCALES_RE = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip locale prefix so auth logic works on plain paths
  const strippedPath = pathname.replace(LOCALES_RE, '/') || '/';

  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value;
  const isLoggedIn = !!sessionToken;
  const isPublic =
    strippedPath === '/' ||
    strippedPath.startsWith('/login') ||
    strippedPath.startsWith('/register') ||
    strippedPath.startsWith('/changelog');

  // Auth-only public pages — redirect logged-in users away from these
  const isAuthPage =
    strippedPath.startsWith('/login') ||
    strippedPath.startsWith('/register');

  const locale = getPreferredLocale({
    pathname,
    cookieLocale: req.cookies.get('NEXT_LOCALE')?.value,
    acceptLanguage: req.headers.get('accept-language'),
  });

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}/todo`, req.nextUrl.origin));
  }

  // Let next-intl handle locale detection / prefixing
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
