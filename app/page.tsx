import { Suspense, ViewTransition } from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import { BookCatalog, BookCatalogSkeleton } from '@/features/book/components/book-catalog';
import { parseSearchParams } from '@/lib/url-state';

export default function Page({ searchParams }: PageProps<'/'>) {
  return (
    <ErrorBoundary
      body="The catalog query failed. Check your database connection and try again."
      title="Can't load books"
    >
      <Suspense fallback={<BookCatalogSkeleton />}>
        {/* One ViewTransition only: a nested one never fires enter or exit. */}
        <ViewTransition
          default="none"
          enter={{ 'nav-back': 'nav-back', 'nav-forward': 'nav-forward', default: 'nav-crossfade' }}
          exit={{ 'nav-back': 'nav-back', 'nav-forward': 'nav-forward', default: 'none' }}
        >
          {searchParams.then(sp => (
            <BookCatalog searchParams={parseSearchParams(sp)} />
          ))}
        </ViewTransition>
      </Suspense>
    </ErrorBoundary>
  );
}
