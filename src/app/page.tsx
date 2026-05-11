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

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description:
      "Collection of small, free utilities for formatting text and JSON and generating identifiers and passwords.",
    url: base,
    inLanguage: "en",
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
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
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={itemListJsonLd} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <header className="max-w-2xl space-y-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {SITE_NAME}: fast utilities for everyday dev work
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            One place for dependable, browser-based helpers—organized by category—with
            long-form explanations, FAQs, and editorial related-tool links tuned for clarity
            (and refreshed when keyword demand shifts).
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
                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {TOOL_CATEGORY_LABELS[tool.categoryId]}
                        </span>
                        <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500" title="Ordering hint from keyword demand (higher surfaces first).">
                          Priority · {tool.searchVolumePriority}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {tool.title}
                        </Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {tool.shortDescription}
                      </p>
                      <p className="mt-4">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                        >
                          Open tool
                        </Link>
                      </p>
                    </article>
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
            Every utility ships with unique metadata, FAQs, curated related links,
            categorical hubs, XML sitemap priority derived from documented demand scores,
            and visible long-form intros so bots and humans see the same story.
          </p>
        </section>
      </main>
    </>
  );
}
