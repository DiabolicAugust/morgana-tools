import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import {
  getToolsGroupedByCategory,
  getToolsSortedBySearchPriority,
  TOOL_CATEGORY_LABELS,
  type ToolCategoryId,
} from "@/lib/tools";

const HOME_OG_TITLE = `${SITE_NAME} — convert and fix files in your browser`;

const HOME_META_DESCRIPTION =
  "Convert and fix files in your browser with free helpers for ebooks, images (HEIC/WebP/AVIF/PNG), JSON, Base64, URLs, timestamps, hashes, and passwords.";

export const metadata: Metadata = {
  title: "Solve format and data jobs in your browser",
  description: HOME_META_DESCRIPTION,
  keywords: [
    "free online converter",
    "browser tools",
    "ebook converter online",
    "image converter online",
    "json formatter",
    "privacy first utilities",
    "HEIC converter",
    "webp converter",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_OG_TITLE,
    description: HOME_META_DESCRIPTION,
  },
  twitter: {
    title: HOME_OG_TITLE,
    description: HOME_META_DESCRIPTION,
  },
};

const HOME_JSONLD_WEBSITE_DESC =
  "Morgana Tools lists free converters and helpers for ebooks, documents, images, UTF-8 text, API-style payloads, passwords, and digests. Most interactive flows run in your browser so files typically stay on your device; pages spell out DRM and format limits.";

/** One-line benefit hint for category jump links (shown as native tooltip). */
const CATEGORY_CHIP_HINT: Record<ToolCategoryId, string> = {
  text: "Clean and reshape pasted text",
  ebooks: "Change ebook and document formats",
  images: "HEIC, WebP, AVIF, PNG—and back again",
  developers: "Format JSON, encode data, read timestamps—no backend round trip",
  security: "Strong passwords and SHA digests for quick checks",
};

/** One sentence under each category heading—one idea per section. */
const CATEGORY_SECTION_INTRO: Record<ToolCategoryId, string> = {
  text: "Paste something messy. Leave with something you can ship.",
  ebooks:
    "Turn open files from one format to another. Locked or DRM-heavy books still need desktop software first.",
  images:
    "iPhone HEIC, WebP for the web, AVIF when your browser allows—download when it works.",
  developers:
    "Format JSON, encode URLs and Base64, read timestamps—all without uploading your snippet to Morgana.",
  security:
    "Generate a strong password or a digest for the job in front of you.",
};

export default function Home() {
  const base = getSiteUrl();
  const groups = getToolsGroupedByCategory();
  const prioritized = getToolsSortedBySearchPriority();

  const organizationId = `${base}/#organization`;
  const websiteId = `${base}/#website`;

  const homeGraphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: base,
        description: HOME_JSONLD_WEBSITE_DESC,
        logo: {
          "@type": "ImageObject",
          url: `${base}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        description: HOME_JSONLD_WEBSITE_DESC,
        url: base,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "ItemList",
        name: `${SITE_NAME} free tool catalog`,
        description:
          "Browse converters by category. Every listing opens a dedicated page with FAQs and clear notes on privacy and limits.",
        numberOfItems: prioritized.length,
        itemListElement: prioritized.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: tool.title,
          url: `${base}/tools/${tool.slug}`,
          description: tool.shortDescription,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={homeGraphJsonLd} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <header className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {SITE_NAME}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Convert and fix files in your browser
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Morgana bundles free helpers that{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              process in your browser when the tool page says they do
            </strong>
            —so images, text, and most conversions usually stay on your device.
            Choose a category, open a tool, download a file or copy a tidy result.
          </p>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            No account needed. Heavy paths (especially some PDF workflows) may
            fetch a vendor script once from the public internet; each page describes
            what pulls from the network and why. Morgana still avoids a standalone “upload your
            file here to convert” queue on flows built for tab-local processing.
          </p>
          <div id="home-categories" className="space-y-2 pt-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              What do you need to fix?
            </p>
            <nav
              aria-label="Jump to tool categories"
              className="flex flex-wrap gap-2 text-sm"
            >
              {groups.map(({ categoryId }) => (
                <a
                  key={categoryId}
                  href={`#category-${categoryId}`}
                  title={CATEGORY_CHIP_HINT[categoryId]}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-600"
                >
                  {TOOL_CATEGORY_LABELS[categoryId]}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <section
          aria-labelledby="trust-local-heading"
          className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
        >
          <h2
            id="trust-local-heading"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            How Morgana handles your files
          </h2>
          <p className="mt-2">
            When a tool is wired for tab-local work, Morgana stays out of your file’s
            path—no Morgana-hosted upload gate for that conversion. If a library needs to
            load from the network (PDF tooling is the usual suspect), each page explains
            what fetched and why, because Safari, Firefox, and Chromium behave differently.
          </p>
        </section>

        <div className="flex flex-col gap-12">
          {groups.map(({ categoryId, tools }) => (
            <section
              key={categoryId}
              id={`category-${categoryId}`}
              aria-labelledby={`category-heading-${categoryId}`}
              className="scroll-mt-24"
            >
              <h2
                id={`category-heading-${categoryId}`}
                className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                {TOOL_CATEGORY_LABELS[categoryId]} tools
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {CATEGORY_SECTION_INTRO[categoryId]}
              </p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:focus-visible:ring-zinc-500"
                    >
                      <h3 className="text-lg font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                        {tool.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {tool.shortDescription}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="max-w-3xl rounded-xl border border-zinc-200 bg-white/60 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Straight answers, not black boxes
          </h2>
          <p className="mt-2 leading-relaxed">
            Every tool spells out what succeeds, what fails, and the questions readers
            actually ask—whether data leaves the tab, whether DRM blocks the workflow,
            and how to unblock a picky browser format.
          </p>
          <p className="mt-3 leading-relaxed">
            Unlike giant jack-of-all-trades gateways, Morgana stays intentionally small:
            if you see it here, it matches the guarantees on the page—not a mystery box on
            the other side.
          </p>
        </section>

        <section
          className="max-w-3xl rounded-xl border border-violet-200/80 bg-violet-50/50 p-6 dark:border-violet-900/40 dark:bg-violet-950/25"
          aria-labelledby="cta-close-heading"
        >
          <h2
            id="cta-close-heading"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Ready to fix one file?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Jump to a category, pick one converter or helper, and run it while the tab stays
            open. Missing a pairing? Bookmark the homepage—we only ship new utilities when we
            can describe them this clearly.
          </p>
          <p className="mt-4">
            <a
              href="#home-categories"
              className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Pick a category to start
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
