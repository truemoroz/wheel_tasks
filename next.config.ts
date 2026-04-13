import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// console.log('[startup] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// console.log('[startup] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
