import {
  StarIcon,
  BookOpenIcon,
  GlobeIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EMPTY_IMAGE_URL, getBookById } from '@/lib/db/queries';
import { Photo } from '@/components/photo';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { SearchParams, stringifySearchParams } from '@/lib/url-state';
import Loading from './loading';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'ita', label: 'Italian' },
  { value: 'ara', label: 'Arabic' },
  { value: 'fre', label: 'French' },
  { value: 'ger', label: 'German' },
  { value: 'ind', label: 'Indonesian' },
  { value: 'por', label: 'Portuguese' },
];

function getLanguageLabel(code: string | null): string {
  if (!code) return 'Unknown';
  const language = LANGUAGES.find((lang) => lang.value === code.toLowerCase());
  return language ? language.label : 'Unknown';
}

type BookPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

export default function Page({ params, searchParams }: BookPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <BookDetails params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function BookDetails({ params, searchParams }: BookPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <ScrollArea className="px-4 h-full">
      <Button variant="ghost" className="mb-4" asChild>
        <Link
          href={`/?${stringifySearchParams(resolvedSearchParams)}`}
          prefetch={true}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Books
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-1/2 md:w-1/4 mx-auto md:mx-0">
          <Photo
            src={book.image_url ?? EMPTY_IMAGE_URL}
            title={book.title}
            thumbhash={book.thumbhash}
            priority={true}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{book.title}</h1>
          <div className="text-lg md:text-xl mb-4">
            {book.authors.map((author, index) => (
              <span key={author}>
                {author}
                {index < book.authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          <div className="flex items-center mb-4">
            <StarRating rating={book.average_rating} />
            <span className="text-lg font-semibold">
              {Number(book.average_rating).toFixed(1)}
            </span>
            <span className="text-gray-600 ml-2">
              ({Number(book.ratings_count).toLocaleString()} ratings)
            </span>
          </div>

          <p className="text-gray-700 mb-6">{book.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2 text-gray-600" />
              <span>{book.num_pages} pages</span>
            </div>
            <div className="flex items-center">
              <GlobeIcon className="w-5 h-5 mr-2 text-gray-600" />
              <span>{getLanguageLabel(book.language_code)}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-600" />
              <span>{book.publication_year}</span>
            </div>
            <div className="flex items-center">
              <span>ISBN: {book.isbn || 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function StarRating({ rating }: { rating: string | null }) {
  if (rating === null) return null;

  return (
    <div className="flex items-center mr-4">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(Number(rating))
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
