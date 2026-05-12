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
    default: `${SITE_NAME} — free browser converters & developer tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Free browser tools for ebooks, HEIC/WebP/AVIF/PNG conversions, JSON, Base64, URLs, timestamps, SHA digests, and passwords—local where each page says so.',
  keywords: [
    'free online tools',
    'browser utilities',
    'image converter online',
    'ebook converter',
    'json formatter online',
    'privacy conscious browser tools',
    SITE_NAME.toLowerCase(),
  ],
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
    title: `${SITE_NAME} — free browser converters & developer tools`,
    description:
      'Convert files, tune developer payloads, and handle security helpers in-browser. Morgana skips a separate “upload here to convert” step on flows that stay local.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — free browser converters & developer tools`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — browser converters & dev tools`,
    description:
      'Ebooks, images, JSON, encoding, hashing, and text helpers in your browser. Local processing where each page promises it.',
    images: ['/twitter-image'],
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
