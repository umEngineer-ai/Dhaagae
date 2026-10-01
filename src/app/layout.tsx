import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DHAAGAÉ — Luxury Handmade Children\'s Couture',
    template: '%s | DHAAGAÉ',
  },
  description:
    'Exquisite handcrafted frocks and children\'s couture for ages 3–5. Pakistani artisanal craftsmanship — Eid, weddings, birthdays. Bespoke customization available.',
  keywords: [
    'children couture Pakistan',
    'handmade frocks',
    'luxury kids fashion',
    'Eid dresses',
    'bespoke children clothing',
    'desi kids fashion',
  ],
  authors: [{ name: 'DHAAGAÉ Couture' }],
  creator: 'DHAAGAÉ Couture',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'DHAAGAÉ Couture',
    title: 'DHAAGAÉ — Luxury Handmade Children\'s Couture',
    description: 'Exquisite handcrafted frocks and children\'s couture for ages 3–5.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DHAAGAÉ — Luxury Handmade Children\'s Couture',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <Navbar />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
