import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import Link from 'next/link';
import { Suspense, ViewTransition } from 'react';
import { BookMark } from '@/components/book-mark';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Toaster } from '@/components/toaster';
import ErrorBoundary from '@/components/ui/error-boundary';
import { WelcomeToast } from '@/components/welcome-toast';
import { BookFilters, BookFiltersFallback } from '@/features/book/components/book-filters';
import { BookSearch, BookSearchFallback } from '@/features/book/components/book-search';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const description = 'Browse two million Goodreads books with instant navigations, streaming search, and URL-driven filters.';

export const viewport: Viewport = {
  themeColor: [
    { color: '#fafafa', media: '(prefers-color-scheme: light)' },
    { color: '#121212', media: '(prefers-color-scheme: dark)' },
  ],
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3000'),
  ),
  openGraph: {
    description,
    siteName: 'Book Inventory',
    title: 'Book Inventory',
    type: 'website',
  },
  title: { default: 'Book Inventory', template: '%s · Book Inventory' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en" suppressHydrationWarning>
      <body className="bg-surface dark:bg-surface-dark text-black antialiased dark:text-white">
        <ThemeProvider>
          <div className="group flex min-h-dvh">
            <ViewTransition default="none" name="sidebar">
              <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r px-5 py-5 md:flex">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    aria-label="Book Inventory home"
                    className="inline-flex items-center gap-2 text-base font-semibold tracking-tight"
                    href="/"
                  >
                    <BookMark className="size-5" />
                    Book Inventory
                  </Link>
                </div>
                <p className="text-muted mt-6 mb-4 text-xs font-semibold tracking-wide uppercase">Filters</p>
                <ErrorBoundary compact title="Filters unavailable">
                  <Suspense fallback={<BookFiltersFallback />}>
                    <BookFilters />
                  </Suspense>
                </ErrorBoundary>
                <div className="border-divider dark:border-divider-dark mt-4 border-t pt-4">
                  <ThemeToggle variant="inline" />
                </div>
              </aside>
            </ViewTransition>

            <div className="flex min-w-0 flex-1 flex-col">
              <ViewTransition default="none" name="search-bar">
                <header className="border-divider bg-surface/80 dark:border-divider-dark dark:bg-surface-dark/80 sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md backdrop-saturate-150 sm:px-6">
                  <Link aria-label="Book Inventory home" className="md:hidden" href="/">
                    <BookMark className="size-5" />
                  </Link>
                  <Suspense fallback={<BookSearchFallback />}>
                    <BookSearch />
                  </Suspense>
                  <div className="md:hidden">
                    <ThemeToggle variant="inline" />
                  </div>
                </header>
              </ViewTransition>

              <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            </div>
          </div>
          <Toaster />
          <WelcomeToast />
        </ThemeProvider>
      </body>
    </html>
  );
}
