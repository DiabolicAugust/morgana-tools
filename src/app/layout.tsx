import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import {
  HOME_META_DESCRIPTION,
  HOME_OPENGRAPH_TITLE,
  SITE_META_KEYWORDS,
  SITE_TITLE_DEFAULT,
} from '@/lib/site-seo';
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
    default: SITE_TITLE_DEFAULT,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_META_DESCRIPTION,
  keywords: [...SITE_META_KEYWORDS],
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
    title: HOME_OPENGRAPH_TITLE,
    description: HOME_META_DESCRIPTION,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: HOME_OPENGRAPH_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_OPENGRAPH_TITLE,
    description: HOME_META_DESCRIPTION,
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
