'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeProvider } from '@/app/components/ColorModeContext';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <ColorModeProvider>
                <CssBaseline />
                {children}
            </ColorModeProvider>
        </AppRouterCacheProvider>
    );
}

