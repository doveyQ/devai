'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

const theme = createTheme({
    primaryColor: 'violet',
    fontFamily: 'var(--font-geist-sans), sans-serif',
    fontFamilyMonospace: 'var(--font-geist-mono), monospace',
    defaultRadius: 'md',
    colors: {
        dark: [
            '#C9C9C9',
            '#b8b8b8',
            '#828282',
            '#696969',
            '#424242',
            '#3b3b3b',
            '#2e2e2e',
            '#1a1a1a',
            '#141414',
            '#0e0e0e',
        ],
    },
});

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            {children}
        </MantineProvider>
    );
}
