import { routing } from './routing';

export type AppLocale = (typeof routing.locales)[number];

const supportedLocales = routing.locales as readonly string[];

function isSupportedLocale(locale: string | undefined): locale is AppLocale {
  return !!locale && supportedLocales.includes(locale);
}

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): AppLocale | undefined {
  if (!acceptLanguage) return undefined;

  return acceptLanguage
    .split(',')
    .map((entry) => {
      const [rawLocale, ...params] = entry.trim().split(';');
      const qParam = params.find((param) => param.trim().startsWith('q='));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { locale: rawLocale.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q)
    .map(({ locale }) => {
      const exactLocale = supportedLocales.find((supported) => supported.toLowerCase() === locale);
      if (exactLocale) return exactLocale as AppLocale;

      const baseLocale = locale.split('-')[0];
      const baseMatch = supportedLocales.find((supported) => supported.toLowerCase() === baseLocale);
      return baseMatch as AppLocale | undefined;
    })
    .find(Boolean);
}

export function getPreferredLocale({
  pathname,
  cookieLocale,
  acceptLanguage,
}: {
  pathname?: string;
  cookieLocale?: string;
  acceptLanguage?: string | null;
} = {}): AppLocale {
  const pathLocale = pathname?.split('/')[1];
  if (isSupportedLocale(pathLocale)) return pathLocale;

  if (isSupportedLocale(cookieLocale)) return cookieLocale;

  return getLocaleFromAcceptLanguage(acceptLanguage ?? null) ?? routing.defaultLocale;
}
