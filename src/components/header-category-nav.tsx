import Link from "next/link";
import { TOOL_CATEGORY_LABELS, type ToolCategoryId } from "@/lib/tools";

type Props = {
  /** Non-empty categories in site nav order (same order as the home catalog). */
  categoryIds: readonly ToolCategoryId[];
};

/** Compact header: category labels only; full tool lists live on the home page. */
export function HeaderCategoryNav({ categoryIds }: Props) {
  return (
    <nav
      aria-label="Browse by category"
      className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:w-auto sm:justify-end"
    >
      {categoryIds.map((categoryId) => (
        <Link
          key={categoryId}
          href={`/#category-${categoryId}`}
          className="shrink-0 font-medium text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          {TOOL_CATEGORY_LABELS[categoryId]}
        </Link>
      ))}
    </nav>
  );
}
