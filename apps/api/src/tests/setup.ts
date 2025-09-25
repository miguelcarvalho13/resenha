/* eslint-disable @typescript-eslint/consistent-type-imports */
import { vi } from 'vitest';

/**
 * This mocks the database when running the tests, so that it uses PGLite in
 * memory as opposed to an actual PostgreSQL database container.
 */
vi.mock('@api/db', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { db: realDb, ...rest } =
    await importOriginal<typeof import('@api/db')>();

  const schema = await importOriginal<typeof import('@api/db/schema')>();

  const { drizzle } =
    await vi.importActual<typeof import('drizzle-orm/pglite')>(
      'drizzle-orm/pglite',
    );

  const { migrate } = await vi.importActual<
    typeof import('drizzle-orm/pglite/migrator')
  >('drizzle-orm/pglite/migrator');

  const db = drizzle({ schema });

  await migrate(db, { migrationsFolder: './drizzle' });

  return { db: db as unknown as typeof realDb, ...rest };
});
