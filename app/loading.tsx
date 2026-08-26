import { BooksGridSkeleton } from "@/components/grid";

export default function Loading() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <BooksGridSkeleton />
    </main>
  );
}
