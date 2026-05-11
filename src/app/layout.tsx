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
    'Free in-browser tools for developers and writers: JSON formatting, Base64 and URL encoding, timestamps, SHA hashes, case conversion, line breaks, UUIDs, and secure passwords—your data stays on your device.',
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
      'JSON, Base64, URL encode/decode, Unix time, SHA hashes, case tools, line breaks, UUIDs, and passwords—fast, private, no upload.',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description:
      'Encoding, hashing, time, text, and security utilities that run locally in your browser.',
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
