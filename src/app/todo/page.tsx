import { redirectToPreferredLocale } from '@/app/localeRedirect';

export default async function Page() {
  await redirectToPreferredLocale('/todo');
}
