import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-200/80 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <p>
        © {year} {SITE_NAME}. Browser-first converters and developer helpers—the site is hosted
        like any other webpage; conversions and parsers run on your machine when each tool promises
        that behavior.
      </p>
      <nav aria-label="Legal" className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link
          href="/privacy"
          className="font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Privacy Policy
        </Link>
      </nav>
    </footer>
  );
}
