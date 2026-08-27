import { NotFoundState } from '@/components/ui/not-found-state';

export default function NotFound() {
  return <NotFoundState body="We couldn't find a book with that id." title="Book not found" />;
}
