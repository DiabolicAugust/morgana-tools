import Link from "next/link";
import { HeaderCategoryNav } from "@/components/header-category-nav";
import { SITE_NAME } from "@/lib/site";
import { getToolsGroupedByCategory } from "@/lib/tools";

export function SiteHeader() {
  const groups = getToolsGroupedByCategory();

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-baseline gap-2">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            {SITE_NAME}
          </Link>
          <span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">
            Free online utilities
          </span>
        </div>
        <HeaderCategoryNav groups={groups} />
      </div>
    </header>
  );
}
