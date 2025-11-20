/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    './eslint',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: { project: './tsconfig.json' },
  plugins: ['jsx-a11y'],
  globals: {
    React: true,
    JSX: true,
  },
  rules: {
    '@typescript-eslint/no-floating-promises': ['error'],
    'react/react-in-jsx-scope': 'off',
    'prefer-template': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
  },
  env: {
    browser: true,
  },
  settings: { react: { version: '18.2.0' } },
  overrides: [
    // Force ESLint to detect .tsx files
    { files: ['*.js?(x)', '*.ts?(x)'] },
  ],
  ignorePatterns: ['tailwind.*.ts', 'vite*.ts'],
};
