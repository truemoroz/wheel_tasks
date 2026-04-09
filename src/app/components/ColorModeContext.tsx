'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

type Mode = 'light' | 'dark';

interface ColorModeContextType {
    mode: Mode;
    toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
    mode: 'dark',
    toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<Mode>('dark');

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
            },
        }),
        [mode],
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'dark'
                        ? {
                              primary: {
                                  // main: '#90caf9',
                                main: '#7729ef',
                              },
                              secondary: {
                                  main: '#f48fb1',
                              },
                              background: {
                                  default: '#222222',
                                  paper: '#1e1e1e',
                              },
                              error: { main: '#f44336' },
                              warning: { main: '#ffa726' },
                              success: { main: '#66bb6a' },
                              info: { main: '#29b6f6' },
                          }
                        : {
                              primary: {
                                  main: '#7729ef',
                                  // main: '#1976d2',
                              },
                              secondary: {
                                  main: '#dc004e',
                              },
                              background: {
                                  default: '#f5f5f5',
                                  paper: '#ffffff',
                              },
                              error: { main: '#d32f2f' },
                              warning: { main: '#ed6c02' },
                              success: { main: '#2e7d32' },
                              info: { main: '#0288d1' },
                          }),
                },
            }),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

