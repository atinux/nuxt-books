import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SearchParams } from "@/lib/url-state";
import { stringifySearchParams } from "@/lib/url-state";

export function BookPagination({
  currentPage,
  totalPages,
  totalResults,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Book pages"
      className="mt-12 flex items-center justify-between gap-4 border-t pt-5"
    >
      <PaginationLink
        page={currentPage - 1}
        disabled={currentPage <= 1}
        searchParams={searchParams}
        label="Previous"
        icon={<ArrowLeft className="size-3.5" />}
      />
      <p className="text-muted-foreground text-center text-xs">
        Page <strong className="text-foreground">{currentPage}</strong> of{" "}
        {totalPages.toLocaleString()}
        <span className="hidden sm:inline">
          {" "}
          · {totalResults.toLocaleString()} results
        </span>
      </p>
      <PaginationLink
        page={currentPage + 1}
        disabled={currentPage >= totalPages}
        searchParams={searchParams}
        label="Next"
        icon={<ArrowRight className="size-3.5" />}
        reverse
      />
    </nav>
  );
}

function PaginationLink({
  page,
  disabled,
  searchParams,
  label,
  icon,
  reverse = false,
}: {
  page: number;
  disabled: boolean;
  searchParams: SearchParams;
  label: string;
  icon: React.ReactNode;
  reverse?: boolean;
}) {
  if (disabled) {
    return (
      <span className="text-muted-foreground/45 inline-flex min-w-20 items-center gap-2 text-xs font-semibold sm:min-w-24">
        {!reverse ? icon : null}
        {label}
        {reverse ? icon : null}
      </span>
    );
  }

  const query = stringifySearchParams({ ...searchParams, page: String(page) });

  return (
    <Link
      href={`/?${query}`}
      prefetch={true}
      className={`hover:bg-accent inline-flex min-w-20 items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:min-w-24 ${reverse ? "justify-end" : ""}`}
    >
      {!reverse ? icon : null}
      {label}
      {reverse ? icon : null}
    </Link>
  );
}
