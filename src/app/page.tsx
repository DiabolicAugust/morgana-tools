import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import {
  getToolsGroupedByCategory,
  getToolsSortedBySearchPriority,
  TOOL_CATEGORY_LABELS,
} from "@/lib/tools";

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
        description:
          "Free browser utilities for JSON, Base64 and URL encoding, Unix timestamps, SHA hashes, text case, line breaks, UUIDs, and password generation.",
        url: base,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "ItemList",
        name: `${SITE_NAME} catalog`,
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
        <header className="max-w-2xl space-y-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {SITE_NAME}: fast utilities for everyday dev work
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            One place for dependable, browser-based helpers—organized by category—with
            long-form explanations, FAQs, and curated related-tool links.
          </p>
          <nav aria-label="Jump to categories" className="flex flex-wrap gap-2 pt-2 text-sm">
            {groups.map(({ categoryId }) => (
              <a
                key={categoryId}
                href={`#category-${categoryId}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-600"
              >
                {TOOL_CATEGORY_LABELS[categoryId]}
              </a>
            ))}
          </nav>
        </header>

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
                {TOOL_CATEGORY_LABELS[categoryId]}
              </h2>
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

        <section className="max-w-2xl rounded-xl border border-zinc-200 bg-white/60 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Built for clarity and discovery
          </h2>
          <p className="mt-2 leading-relaxed">
            Each tool page includes a clear overview, FAQs, related links, and structured
            data—so search engines and visitors get consistent, accurate descriptions.
          </p>
        </section>
      </main>
    </>
  );
}
