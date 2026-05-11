import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getSiteUrl, SITE_NAME } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — free online developer utilities`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Free, fast browser utilities: remove line breaks, format JSON, generate UUID v4 identifiers, and create strong passwords. SEO-friendly pages with usable defaults.',
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — developer utilities`,
    description:
      'Format JSON, remove line breaks, generate UUIDs, and build secure passwords—all in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description:
      'Free online utilities for text, JSON, UUIDs, and passwords. Static pages tuned for clarity and discovery.',
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: 'IAMnX77PX2kLqyIrbTxfOI1TdG8gBBXOZ1hmTj5zguM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
