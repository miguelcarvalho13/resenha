# react-trpc-turbo

## Technologies used

- Turborepo
- React Vite
- Express.js
- tRPC
- TanStack Router
- Tailwind CSS

### Apps and Packages

- `@repo/web`: Vite, React, TanStack Router and tRPC Client
- `@repo/api`: Express.js and tRPC Server
- `@repo/database`: Drizzle and database connection
- `@repo/eslint-config`: `eslint` configurations
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/tailwind-config`: shared Tailwind configuration

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

To get started, clone the repository and install the dependencies:

```
pnpm install
```

Then, copy the `.env.example` file to `.env` in the apps/web/ folder and fill in the necessary environment variables. For local development, the default value will work. If you want to deploy the app, you will need to specify where the backend is hosted.

```
cp ./apps/web/.env.example ./apps/web/.env
```

Then, copy the `.env.example` file to `.env` in the packages/database/ folder which should be have all the necessary env vars already set up for local development.

```
cp ./packages/database/.env.example ./packages/database/.env
```

Then, copy the `.env.example` file to `.env` in the apps/api/ and generate the BETTER_AUTH_SECRET env following the steps described [here](https://www.better-auth.com/docs/installation#set-environment-variables).

```
cp ./apps/api/.env.example ./apps/api/.env
```

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To run the local database:
```
docker compose up
```
**Note:** This also creates an adminer instance on http://localhost:8585 for manual inspection of the database.

To run all apps and packages in development mode, run the following command:

```
pnpm dev
```
