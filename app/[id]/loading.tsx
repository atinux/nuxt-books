import { BookDetailsSkeleton } from "./page";

export default function Loading() {
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <BookDetailsSkeleton />
    </main>
  );
}
