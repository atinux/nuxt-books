"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/photo";
import type { BookSummary } from "@/lib/db/queries";
import type { SearchParams } from "@/lib/url-state";
import { stringifySearchParams } from "@/lib/url-state";

export function BookLink({
  book,
  priority,
  searchParams,
}: {
  book: BookSummary;
  priority: boolean;
  searchParams: SearchParams;
}) {
  const [intent, setIntent] = useState(false);
  const query = stringifySearchParams(searchParams);
  const href = `/${book.id}${query ? `?${query}` : ""}` as const;

  return (
    <Link
      href={href}
      prefetch={intent ? true : undefined}
      onPointerEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      className="group block min-w-0 rounded-[1.1rem] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <Photo
        src={book.image_url}
        title={book.title}
        thumbhash={book.thumbhash}
        priority={priority}
      />
      <div className="px-0.5 pt-3">
        <h2 className="line-clamp-2 text-sm leading-5 font-semibold tracking-[-0.01em]">
          {book.title}
        </h2>
        <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
          {book.publication_year ? <span>{book.publication_year}</span> : null}
          {book.publication_year && book.average_rating ? (
            <span aria-hidden="true">·</span>
          ) : null}
          {book.average_rating ? (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3 fill-current text-amber-600" />
              {Number(book.average_rating).toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
