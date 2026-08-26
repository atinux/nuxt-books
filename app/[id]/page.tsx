import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  Globe2,
  Star,
} from "lucide-react";
import { Suspense } from "react";
import { Photo } from "@/components/photo";
import { getBookById } from "@/lib/db/queries";
import { parseSearchParams, stringifySearchParams } from "@/lib/url-state";

const languageNames: Record<string, string> = {
  eng: "English",
  en: "English",
  "en-US": "English",
  "en-GB": "English",
  spa: "Spanish",
  ita: "Italian",
  ara: "Arabic",
  fre: "French",
  ger: "German",
  ind: "Indonesian",
  por: "Portuguese",
};

type RawSearchParams = Record<string, string | string[] | undefined>;
type BookPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  return book ? { title: book.title, description: book.description } : {};
}

export default function Page({ params, searchParams }: BookPageProps) {
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <Suspense fallback={<BookDetailsSkeleton />}>
        <BookDetails params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BookDetails({
  params,
  searchParams,
}: {
  params: BookPageProps["params"];
  searchParams: BookPageProps["searchParams"];
}) {
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  const book = await getBookById(id);
  if (!book) notFound();

  const query = stringifySearchParams(parseSearchParams(rawSearchParams));

  return (
    <article className="book-enter mx-auto max-w-6xl">
      <Link
        href={query ? `/?${query}` : "/"}
        prefetch={true}
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to the shelves
      </Link>

      <div className="grid items-start gap-8 md:grid-cols-[minmax(220px,0.68fr)_minmax(0,1.5fr)] lg:gap-14">
        <div className="mx-auto w-full max-w-[340px] md:sticky md:top-32">
          <Photo
            src={book.image_url}
            title={book.title}
            thumbhash={book.thumbhash}
            priority
            sizes="(min-width: 768px) 28vw, 80vw"
          />
        </div>

        <div className="pt-1">
          <p className="text-primary mb-3 text-xs font-semibold tracking-[0.16em] uppercase">
            {book.publisher ?? "From the collection"}
          </p>
          <h1 className="font-serif text-balance text-4xl leading-[0.98] font-medium tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            {book.title}
          </h1>
          {book.authors.length ? (
            <p className="text-muted-foreground mt-4 text-lg">
              by {book.authors.join(", ")}
            </p>
          ) : null}

          {book.average_rating ? (
            <div className="mt-7 flex items-center gap-3 border-y py-4">
              <span className="text-primary inline-flex items-center gap-1.5 font-semibold">
                <Star className="size-4 fill-current text-amber-600" />
                {Number(book.average_rating).toFixed(2)}
              </span>
              <span className="text-muted-foreground text-sm">
                {book.ratings_count?.toLocaleString() ?? "No"} ratings
              </span>
            </div>
          ) : null}

          <p className="text-foreground/80 mt-7 max-w-3xl text-base leading-7">
            {book.description ||
              "No description is available for this edition yet."}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4">
            <Fact
              icon={<CalendarDays />}
              label="Published"
              value={book.publication_year?.toString() ?? "Unknown"}
            />
            <Fact
              icon={<BookOpen />}
              label="Length"
              value={book.num_pages ? `${book.num_pages} pages` : "Unknown"}
            />
            <Fact
              icon={<Globe2 />}
              label="Language"
              value={
                book.language_code
                  ? (languageNames[book.language_code] ?? book.language_code)
                  : "Unknown"
              }
            />
            <Fact
              icon={<Building2 />}
              label="ISBN"
              value={book.isbn ?? "Not listed"}
            />
          </dl>
        </div>
      </div>
    </article>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card min-w-0 p-4">
      <dt className="text-muted-foreground flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

export function BookDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse" aria-busy="true">
      <div className="bg-muted mb-8 h-8 w-32 rounded-lg" />
      <div className="grid gap-8 md:grid-cols-[minmax(220px,0.68fr)_minmax(0,1.5fr)] lg:gap-14">
        <div className="bg-muted mx-auto aspect-[2/3] w-full max-w-[340px] rounded-[1.1rem]" />
        <div className="space-y-5 py-4">
          <div className="bg-muted h-3 w-28 rounded-full" />
          <div className="bg-muted h-14 w-4/5 rounded-xl" />
          <div className="bg-muted h-4 w-2/5 rounded-full" />
          <div className="bg-muted mt-10 h-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
