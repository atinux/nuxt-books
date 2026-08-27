import Link from 'next/link';
import { BookMark } from '@/components/book-mark';
import { Button } from '@/components/ui/button';

export function NotFoundState({ body, title }: { body: string; title: string }) {
  return (
    <div className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <BookMark animated className="mb-1 size-10" />
        <p className="text-muted text-sm tabular-nums">404</p>
        <h1 className="text-xl font-semibold tracking-tight sm:text-xl">{title}</h1>
        <p className="text-muted text-sm leading-6">{body}</p>
        <Button className="mt-1" render={<Link href="/" />} variant="secondary">
          Back to the shelf
        </Button>
      </div>
    </div>
  );
}
