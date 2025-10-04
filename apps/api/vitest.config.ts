import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./src/tests/setup.ts'],
    // TODO: Check if it's possible to re-enable this (it's mainly needed due to to db/server mock)
    fileParallelism: false,
  },
});
