import type { Route } from "next";
import Link from "next/link";
import { PendingArrow } from "@/components/pending-arrow";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { SearchParams, stringifySearchParams } from "@/lib/url-state";

function getPageHref(searchParams: SearchParams, page: number): Route {
  const query = stringifySearchParams({
    ...searchParams,
    page: page.toString(),
  });
  return `/?${query}` as Route;
}

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
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent className="flex items-center justify-between">
        <PaginationItem>
          {currentPage <= 1 ? (
            <Button
              variant="ghost"
              size="icon"
              disabled
              aria-label="Previous page"
            >
              ←
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={getPageHref(searchParams, currentPage - 1)}
                prefetch={true}
                scroll={false}
                aria-label="Previous page"
              >
                <PendingArrow>←</PendingArrow>
              </Link>
            </Button>
          )}
        </PaginationItem>

        <div className="text-sm text-muted-foreground">
          {totalResults.toLocaleString()} results (
          {currentPage.toLocaleString()} of {totalPages.toLocaleString()})
        </div>

        <PaginationItem>
          {currentPage >= totalPages ? (
            <Button variant="ghost" size="icon" disabled aria-label="Next page">
              →
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={getPageHref(searchParams, currentPage + 1)}
                prefetch={true}
                scroll={false}
                aria-label="Next page"
              >
                <PendingArrow>→</PendingArrow>
              </Link>
            </Button>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
