import type { BookDetails } from '@/features/book/book-queries';

const COVERS = [
  'https://images.gr-assets.com/books/1310220028m/5333265.jpg',
  'https://images.gr-assets.com/books/1304100136m/7327624.jpg',
];

const TITLE_PREFIX = [
  'The Silent',
  'A Brief History of the',
  'Notes on the',
  'The Long',
  'Small',
  'The Quiet',
  'After the',
  'The Second',
  'Letters from the',
  'The Hollow',
  'Field Notes on the',
  'The Paper',
];

const TITLE_SUFFIX = [
  'Archive',
  'Cartographers',
  'Harbor',
  'Almanac',
  'Observatory',
  'Inventory',
  'Migration',
  'Meridian',
  'Catalogue',
  'Foundry',
  'Aperture',
  'Reservoir',
];

const AUTHOR_NAMES = [
  'Mara Ellison',
  'Tomas Vance',
  'Ines Okafor',
  'Rafael Lindqvist',
  'Noor Haddad',
  'Greta Sandoval',
  'Yusuf Beringer',
  'Clara Nakamura',
  'Emil Draper',
  'Sofia Marchetti',
];

const PUBLISHERS = ['Northgate Press', 'Alder & Vine', 'Meridian House', 'Coldwater Books', 'Halcyon Editions'];

// Avoids the words the tests search for ("wizard", "Fields").
export const GENERATED_PREVIEW_BOOKS: BookDetails[] = Array.from({ length: 44 }, (_, index) => {
  const prefix = TITLE_PREFIX[index % TITLE_PREFIX.length];
  const suffix = TITLE_SUFFIX[(index * 5 + 3) % TITLE_SUFFIX.length];

  return {
    authors: [AUTHOR_NAMES[index % AUTHOR_NAMES.length]],
    average_rating: (3 + ((index * 7) % 20) / 10).toFixed(2),
    description:
      'A generated entry in the preview catalog, used so the app has a browsable, paginated shelf without a database connection.',
    id: 900_001 + index,
    image_url: COVERS[index % COVERS.length],
    isbn: `978000000${String(index).padStart(4, '0')}`,
    language_code: 'eng',
    num_pages: 180 + ((index * 37) % 620),
    publication_year: 1962 + ((index * 13) % 60),
    publisher: PUBLISHERS[index % PUBLISHERS.length],
    ratings_count: 120 + index * 431,
    thumbhash: null,
    title: `${prefix} ${suffix}`,
  };
});
