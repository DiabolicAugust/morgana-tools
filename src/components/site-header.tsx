import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { getToolsSortedBySearchPriority } from "@/lib/tools";

export function SiteHeader() {
  const toolsNav = getToolsSortedBySearchPriority();

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-baseline gap-2">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            {SITE_NAME}
          </Link>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Free online utilities
          </span>
        </div>
        <nav aria-label="Tools" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {toolsNav.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {tool.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
