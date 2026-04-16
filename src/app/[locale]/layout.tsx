import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ThemeRegistry from '@/app/components/ThemeRegistry';
import AppBarComponent from '@/app/components/AppBar';
import AuthProvider from '@/app/components/AuthProvider';
import TelegramTools from '@/app/components/TelegramTools';
import AgentChat from '@/app/components/AgentChat';
import { SpheresRefetchProvider } from '@/app/components/SpheresRefetchContext';

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
          <SpheresRefetchProvider>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
              <AppBarComponent />
              <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {children}
              </div>
            </div>
            <AgentChat />
            <TelegramTools />
          </SpheresRefetchProvider>
        </AuthProvider>
      </ThemeRegistry>
    </NextIntlClientProvider>
  );
}

