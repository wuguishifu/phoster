import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import '@/styles/globals.css';

import { cn } from '@/lib/utils';
import { Providers } from './providers';

const nunito = Nunito({
    subsets: ['latin'],
    variable: '--font-sans-serif'
});

export const metadata: Metadata = {
    title: 'Phoster',
    description: 'Built by Bo Bramer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={cn('h-screen bg-background antialiased', nunito.className)}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
};