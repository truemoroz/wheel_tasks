import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ThemeRegistry from '@/app/components/ThemeRegistry';
import AppBarComponent from '@/app/components/AppBar';
import AuthProvider from '@/app/components/AuthProvider';
import FeedbackChat from '@/app/components/FeedbackChat';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeRegistry>
        <AuthProvider>
          <AppBarComponent />
          {children}
          <FeedbackChat />
        </AuthProvider>
      </ThemeRegistry>
    </NextIntlClientProvider>
  );
}

