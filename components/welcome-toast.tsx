'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function WelcomeToast() {
  useEffect(() => {
    // Skip on short viewports, where the toast would cover the grid.
    if (window.innerHeight < 650) return;
    if (document.cookie.includes('books-toast=2')) return;

    toast('Welcome to Book Inventory', {
      description: (
        <>
          Search, filter, and page through two million Goodreads books — with instant navigations from Cache Components
          and Partial Prefetching.{' '}
          <a
            className="text-accent font-medium hover:underline"
            href="https://github.com/aurorascharff/book-inventory-16"
            rel="noopener noreferrer"
            target="_blank"
          >
            View the source
          </a>
          .
        </>
      ),
      duration: Infinity,
      id: 'books-toast',
      onDismiss: () => {
        document.cookie = 'books-toast=2; max-age=31536000; path=/';
      },
    });
  }, []);

  return null;
}
