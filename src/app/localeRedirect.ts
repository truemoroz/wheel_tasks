import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPreferredLocale } from '@/i18n/detectLocale';

export async function redirectToPreferredLocale(path = '') {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getPreferredLocale({
    cookieLocale: cookieStore.get('NEXT_LOCALE')?.value,
    acceptLanguage: headersList.get('accept-language'),
  });

  redirect(`/${locale}${path}`);
}
