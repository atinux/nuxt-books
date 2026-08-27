import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Crossfade } from '@/components/ui/crossfade';
import { DirectionalSlide } from '@/components/ui/directional-slide';
import ErrorBoundary from '@/components/ui/error-boundary';
import { PageHeader } from '@/components/ui/page-header';
import { getBookById } from '@/features/book/book-queries';
import { BookDetail, BookDetailSkeleton } from '@/features/book/components/book-detail';
import { buildHref, parseSearchParams } from '@/lib/url-state';
import type { RawSearchParams } from '@/lib/url-state';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: 'Book not found' };
  return {
    description: book.description ?? undefined,
    title: book.title,
  };
}

export default function Page({ params, searchParams }: Props) {
  return (
    <DetailLayout searchParams={searchParams}>
      <ErrorBoundary body="We couldn't load this book's details." title="Can't load book">
        <Suspense fallback={<BookDetailSkeleton />}>
          <Crossfade>
            <BookDetails params={params} />
          </Crossfade>
        </Suspense>
      </ErrorBoundary>
    </DetailLayout>
  );
}

async function BookDetails({ params }: { params: Props['params'] }) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();
  return <BookDetail book={book} />;
}

/**
 * The header renders outside Suspense so the back link is interactive from the
 * App Shell — before the book itself has streamed in.
 */
function DetailLayout({ children, searchParams }: { children: ReactNode; searchParams: Props['searchParams'] }) {
  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-6">
      <Suspense fallback={<PageHeader className="mb-6" />}>
        {searchParams.then(raw => (
          <PageHeader backHref={buildHref(parseSearchParams(raw))} className="mb-6" />
        ))}
      </Suspense>
      <DirectionalSlide name="book-detail">{children}</DirectionalSlide>
    </div>
  );
}
