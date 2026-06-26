import { redirectToPreferredLocale } from '@/app/localeRedirect';

// The middleware redirects "/" to "/{locale}" at runtime.
// This page handles the static prerender case.
export default async function RootPage() {
  await redirectToPreferredLocale();
}
