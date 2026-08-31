'use client';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FastLink } from '@/components/ui/fast-link';

export default function NotFound() {
  return (
    <EmptyState body="We couldn't find a book with that id." title="Book not found">
      <Button className="mt-1" render={<FastLink href="/" />} variant="secondary">
        Back to the shelf
      </Button>
    </EmptyState>
  );
}
