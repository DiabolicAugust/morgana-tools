import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl, SITE_NAME } from '@/lib/site';

const path = '/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    `${SITE_NAME}: how we collect data—most interactive tools describe on-device handling; CDN delivery and ordinary hosting logs still apply.`,
  keywords: [
    SITE_NAME.toLowerCase(),
    'privacy policy',
    'browser tools privacy',
    'client side processing',
  ],
  alternates: {
    canonical: path,
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  const base = getSiteUrl();
  const canonical = `${base}${path}`;
  const lastUpdated = 'May 11, 2026';

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-zinc-800 sm:px-6 dark:text-zinc-200">
      <article className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/"
              className="font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              Home
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            Privacy
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-6 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3" aria-labelledby="overview-heading">
            <h2
              id="overview-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Overview
            </h2>
            <p>
              {SITE_NAME} ({canonical}) offers free helpers designed to execute
              in{' '}
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                your web browser
              </strong>
              whenever a tool advertises local processing: pasted text,
              freshly generated passwords, images you decode, manuscripts you
              convert, and related payloads ordinarily stay inside that tab—we
              are not deliberately ingesting those bits as Morgana-hosted uploads for
              the conversion itself.
            </p>
          </section>

          <section className="space-y-3" aria-labelledby="collection-heading">
            <h2
              id="collection-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Information we receive
            </h2>
            <ul className="list-disc space-y-2 ps-5">
              <li>
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  Hosting and delivery.
                </strong>{' '}
                When you visit the site, your browser sends standard HTTP
                requests (e.g. URL, referrer, timestamps, browser type,
                language). Your hosting provider or infrastructure may retain
                access or server logs. We use this data only for operating and
                securing the service, consistent with ordinary website
                operation.
              </li>
              <li>
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  Embedded third parties.
                </strong>{' '}
                If we use third-party fonts, CDNs, or similar resources, those
                providers may process requests according to their own policies.
                We keep reliance on vendors as small as we can without breaking the tools.
              </li>
              <li>
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  Cookies or local storage.
                </strong>{' '}
                Morgana&apos;s utilities do not need advertising trackers to
                operate. Browser storage stays limited—if anything is persisted,
                it is for benign UI tweaks on your machine, not centralized ad
                profiles.
              </li>
            </ul>
          </section>

          <section className="space-y-3" aria-labelledby="accounts-heading">
            <h2
              id="accounts-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Accounts and uploads
            </h2>
            <p>
              You do not need an account or a profile to run {SITE_NAME}. File-centric
              converters and parsers keep work in the browser wherever a page describes
              that workflow, instead of bouncing your payload through a Morgana
              ingestion queue solely to apply the transformation.
            </p>
          </section>

          <section className="space-y-3" aria-labelledby="children-heading">
            <h2
              id="children-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Children&apos;s privacy
            </h2>
            <p>
              These utilities are aimed at general and professional audiences.
              We do not knowingly collect personal data from children for
              marketing or profiling.
            </p>
          </section>

          <section className="space-y-3" aria-labelledby="rights-heading">
            <h2
              id="rights-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Your choices and retention
            </h2>
            <p>
              Because most processing stays in your browser, clearing your
              browsing data or closing the tab typically stops local handling of
              drafts you had not exported. Logs retained by hosts are governed
              by retention settings of our infrastructure providers and rotated
              as reasonably appropriate.
            </p>
          </section>

          <section className="space-y-3" aria-labelledby="changes-heading">
            <h2
              id="changes-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy occasionally. Updates will
              appear on this page with a revised “Last updated” date. By
              continuing to use the site after updates are posted, you
              acknowledge the revised policy.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
