import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteUrl, SITE_NAME } from '@/lib/site';

const path = '/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} handles your data. Our utilities run in your browser; we do not ask you to upload content to our servers for processing.`,
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
              {SITE_NAME} ({canonical}) provides free utilities that run
              primarily in{' '}
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                your web browser
              </strong>
              . We design the interactive tools so that your input (text,
              passwords you generate locally, images you convert, etc.) is
              ordinarily processed on your device—not sent to our servers solely
              to run those conversions or transformations.
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
                We keep third-party reliance minimal.
              </li>
              <li>
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  Cookies or local storage.
                </strong>{' '}
                The site does not rely on intrusive tracking for its core
                utilities. Essential browser storage (if used) would be limited
                to things like remembering UI preferences locally in your
                browser. We do not operate behavioral ad tracking as part of
                these tools based on current implementation.
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
              You do not need an account to use {SITE_NAME}. We do not require
              you to submit personal identifiers to run the utilities. Tools
              that manipulate files or text do their work client-side whenever
              possible so that we are not deliberately collecting your pasted
              content as a catalog of uploads.
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
