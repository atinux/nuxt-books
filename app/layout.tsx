import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Code2, SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";
import { Filter, FilterFallback } from "@/components/filters";
import { Search, SearchFallback } from "@/components/search";

export const metadata: Metadata = {
  title: {
    default: "Book Inventory",
    template: "%s · Book Inventory",
  },
  description:
    "Search and browse a vast library with instant Next.js navigation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <header className="border-border/80 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="Book Inventory home"
            >
              <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-sm transition-transform group-hover:-rotate-3">
                <BookOpenText className="size-4.5" strokeWidth={2.2} />
              </span>
              <span className="font-serif text-xl font-semibold tracking-[-0.02em]">
                Book Inventory
              </span>
              <span className="border-primary/15 bg-primary/8 text-primary hidden rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase sm:inline-flex">
                Next 16
              </span>
            </Link>

            <a
              href="https://github.com/vercel-labs/book-inventory-16"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground ml-auto inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              aria-label="View source on GitHub"
            >
              <Code2 className="size-4.5" />
            </a>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-border/70 sticky top-16 hidden h-[calc(100svh-4rem)] border-r p-6 lg:block">
            <div className="mb-5">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                Refine the shelves
              </p>
            </div>
            <Suspense fallback={<FilterFallback />}>
              <Filter />
            </Suspense>
          </aside>

          <div className="min-w-0">
            <div className="bg-background/75 sticky top-16 z-30 border-b px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Suspense fallback={<SearchFallback />}>
                  <Search />
                </Suspense>
                <details className="group relative lg:hidden">
                  <summary className="border-border bg-card hover:bg-accent flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border shadow-sm transition-colors [&::-webkit-details-marker]:hidden">
                    <SlidersHorizontal className="size-4" />
                    <span className="sr-only">Open filters</span>
                  </summary>
                  <div className="bg-card absolute top-14 right-0 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border p-5 shadow-2xl">
                    <Suspense fallback={<FilterFallback />}>
                      <Filter />
                    </Suspense>
                  </div>
                </details>
              </div>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
