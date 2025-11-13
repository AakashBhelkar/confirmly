import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../src/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Confirmly - Reduce RTO by 60%+',
  description: 'AI-powered platform that reduces Return-to-Origin losses for eCommerce brands',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

