import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { Base64Tool } from '@/components/tools/base64-tool';
import { CaseConverterTool } from '@/components/tools/case-converter-tool';
import { HashGeneratorTool } from '@/components/tools/hash-generator-tool';
import { JsonFormatterTool } from '@/components/tools/json-formatter-tool';
import { LineBreakRemoverTool } from '@/components/tools/line-break-remover-tool';
import { PasswordGeneratorTool } from '@/components/tools/password-generator-tool';
import { TimestampConverterTool } from '@/components/tools/timestamp-converter-tool';
import { UrlEncodeTool } from '@/components/tools/url-encode-tool';
import { UuidGeneratorTool } from '@/components/tools/uuid-generator-tool';
import { getSiteUrl, SITE_NAME } from '@/lib/site';
import {
  getAllToolSlugs,
  getRelatedTools,
  getToolBySlug,
  TOOL_CATEGORY_LABELS,
} from '@/lib/tools';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return { title: 'Tool not found' };
  }

  const base = getSiteUrl();
  const path = `/tools/${tool.slug}`;
  const url = `${base}${path}`;
  const title = tool.title;

  return {
    title,
    description: tool.description,
    keywords: [
      ...tool.keywords,
      TOOL_CATEGORY_LABELS[tool.categoryId],
      'free online tool',
      'browser utility',
    ],
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url,
      title: `${title} — ${SITE_NAME}`,
      description: tool.shortDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description: tool.shortDescription,
    },
  };
}

function ToolPanels({ slug }: { slug: string }) {
  switch (slug) {
    case 'remove-line-breaks':
      return <LineBreakRemoverTool />;
    case 'json-formatter':
      return <JsonFormatterTool />;
    case 'uuid-generator':
      return <UuidGeneratorTool />;
    case 'password-generator':
      return <PasswordGeneratorTool />;
    case 'base64-encoder-decoder':
      return <Base64Tool />;
    case 'case-converter':
      return <CaseConverterTool />;
    case 'url-encoder-decoder':
      return <UrlEncodeTool />;
    case 'timestamp-converter':
      return <TimestampConverterTool />;
    case 'hash-generator':
      return <HashGeneratorTool />;
    default:
      return null;
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const base = getSiteUrl();
  const panel = ToolPanels({ slug });
  const related = getRelatedTools(tool);

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.longDescription,
    url: `${base}/tools/${tool.slug}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript for interactive portions.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: base,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: TOOL_CATEGORY_LABELS[tool.categoryId],
        item: `${base}/#category-${tool.categoryId}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.title,
        item: `${base}/tools/${tool.slug}`,
      },
    ],
  };

  const faqJsonLd =
    tool.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

  const categoryHref = `/#category-${tool.categoryId}`;

  return (
    <>
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={categoryHref}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {TOOL_CATEGORY_LABELS[tool.categoryId]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-zinc-900 dark:text-zinc-100">{tool.title}</li>
          </ol>
        </nav>

        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {TOOL_CATEGORY_LABELS[tool.categoryId]}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {tool.title}
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {tool.description}
          </p>
        </header>

        <section
          aria-labelledby="long-desc-heading"
          className="space-y-3 text-base leading-relaxed text-zinc-700 dark:text-zinc-300"
        >
          <h2 id="long-desc-heading" className="sr-only">
            Overview
          </h2>
          {tool.longDescription.split(/\n\n+/).map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </section>

        {panel}

        {tool.faq.length > 0 ? (
          <section aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Frequently asked questions
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {tool.faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <summary className="cursor-pointer list-none font-medium text-zinc-900 outline-none marker:content-none dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-2">
                      {item.question}
                      <span
                        className="text-zinc-400 transition group-open:rotate-45 dark:text-zinc-500"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section
            aria-labelledby="related-tools"
            className="border-t border-zinc-200 pt-8 dark:border-zinc-800"
          >
            <h2
              id="related-tools"
              className="text-lg font-medium text-zinc-900 dark:text-zinc-100"
            >
              Related tools
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              You may also find these tools useful.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {related.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="block rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {t.title}
                    </span>
                    <span className="mt-1 block text-zinc-600 dark:text-zinc-400">
                      {t.shortDescription}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
