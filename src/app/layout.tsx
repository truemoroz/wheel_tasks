import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { inter } from '@/app/ui/fonts';
import ThemeRegistry from '@/app/components/ThemeRegistry';
import AppBarComponent from '@/app/components/AppBar';
import AuthProvider from '@/app/components/AuthProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wheel path - Personal Dashboard for a Balanced Life",
  description: "Define your priorities, set goals, and track tasks across 8 key areas of your life. Rate each sphere, create actionable goals, and stay organized with a simple task list. Your personal dashboard for a balanced life.",
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
        className={`${inter.className} antialiased`}
      >
        <ThemeRegistry>
          <AuthProvider>
            <AppBarComponent />
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
