import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient } from '@libsql/client';
import { toBookFilters, toBookQuery } from '../../../shared/utils/book-utils';
import { buildCatalogCountStatement, buildCatalogPageStatement } from './catalog-query';

const CATALOG_INDEX_SQL = `
  CREATE INDEX idx_books_catalog
  ON books (id, publication_year, num_pages, average_rating, language_code, isbn)
  WHERE publication_year >= 1950
    AND publication_year <= 2023
    AND num_pages <= 1000
    AND image_url IS NOT NULL
    AND image_url != 'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png'
`;

test('catalog statements use the partial index without sorting', async () => {
  const client = createClient({ url: ':memory:' });

  try {
    await client.execute(`
      CREATE TABLE books (
        average_rating REAL,
        id INTEGER PRIMARY KEY,
        image_url TEXT,
        isbn TEXT,
        language_code TEXT,
        num_pages INTEGER,
        publication_year INTEGER,
        thumbhash TEXT,
        title TEXT NOT NULL
      )
    `);
    await client.execute(CATALOG_INDEX_SQL);

    const query = toBookQuery({});
    const page = buildCatalogPageStatement(query);
    const count = buildCatalogCountStatement(toBookFilters(query));
    const pagePlan = await client.execute({ args: page.args, sql: `EXPLAIN QUERY PLAN ${page.sql}` });
    const countPlan = await client.execute({ args: count.args, sql: `EXPLAIN QUERY PLAN ${count.sql}` });
    const pageDetails = pagePlan.rows.map(row => String(row.detail)).join('\n');
    const countDetails = countPlan.rows.map(row => String(row.detail)).join('\n');

    assert.match(pageDetails, /USING INDEX idx_books_catalog/);
    assert.doesNotMatch(pageDetails, /TEMP B-TREE/);
    assert.match(countDetails, /USING INDEX idx_books_catalog/);
  } finally {
    client.close();
  }
});

test('catalog statements bind user-controlled filters', () => {
  const search = `Potter' OR 1=1 --`;
  const statement = buildCatalogPageStatement(
    toBookQuery({ language: 'spa', pages: '300', rating: '4', search, year: '2000' }),
  );

  assert.equal(statement.sql.includes(search), false);
  assert.deepEqual(statement.args.slice(0, 5), [2000, 300, 4, 'spa', `"Potter'" AND "OR" AND "1=1" AND "--"`]);
});
