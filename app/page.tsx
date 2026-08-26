import { Suspense } from 'react';
import { BooksGrid } from '@/components/grid';
import { BookPagination } from '@/components/book-pagination';
import { getBooksPage, ITEMS_PER_PAGE } from '@/lib/db/queries';
import { parseSearchParams } from '@/lib/url-state';
import Loading from './loading';

type RawSearchParams = Record<string, string | string[] | undefined>;

export default function Page({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <BookResults searchParams={searchParams} />
    </Suspense>
  );
}

async function BookResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const parsedSearchParams = parseSearchParams(await searchParams);
  const { books, total } = await getBooksPage(parsedSearchParams);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const currentPage = Math.max(1, Number(parsedSearchParams.page) || 1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto min-h-[200px]">
        <div className="group-has-[[data-pending]]:animate-pulse p-4">
          <BooksGrid books={books} searchParams={parsedSearchParams} />
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
        <BookPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={total}
          searchParams={parsedSearchParams}
        />
      </div>
    </div>
  );
}
