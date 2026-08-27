import { PageHeader } from '@/components/ui/page-header';
import { BookDetailSkeleton } from '@/features/book/components/book-detail';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-6">
      <PageHeader backHref="/" className="mb-6" />
      <BookDetailSkeleton />
    </div>
  );
}
