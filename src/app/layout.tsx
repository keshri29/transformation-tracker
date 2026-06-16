import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppInitializer } from '@/components/AppInitializer';
import BottomNav from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: '90 Day Transformation',
  description: 'Track your 90-day personal transformation journey',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: '90 Day' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`}>
        <AppInitializer />
        <main className="min-h-screen pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
