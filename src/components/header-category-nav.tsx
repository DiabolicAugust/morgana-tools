"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  TOOL_CATEGORY_LABELS,
  type ToolCategoryId,
  type ToolDefinition,
} from "@/lib/tools";

export type CategoryGroup = {
  categoryId: ToolCategoryId;
  tools: ToolDefinition[];
};

export function HeaderCategoryNav({ groups }: { groups: CategoryGroup[] }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const root = navRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      root.querySelectorAll("details[open]").forEach((el) => {
        el.removeAttribute("open");
      });
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleDetailsToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const details = e.currentTarget;
    if (!details.open) return;
    const root = navRef.current;
    if (!root) return;
    root.querySelectorAll("details").forEach((el) => {
      if (el !== details) el.removeAttribute("open");
    });
  }

  return (
    <nav
      ref={navRef}
      aria-label="Browse by category"
      className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-1"
    >
      {groups.map(({ categoryId, tools }) => (
        <details
          key={categoryId}
          className="relative w-full sm:w-auto"
          onToggle={handleDetailsToggle}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 sm:justify-center sm:border-0 sm:py-1.5 [&::-webkit-details-marker]:hidden">
            <span>{TOOL_CATEGORY_LABELS[categoryId]}</span>
            <span className="text-zinc-400 dark:text-zinc-500" aria-hidden>
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </span>
          </summary>
          <div className="relative z-50 mt-px sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-0 sm:pt-1">
            <ul
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:min-w-48"
              role="list"
            >
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </nav>
  );
}
