ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack install --global pnpm@8.9.0

FROM base AS prepare
WORKDIR /app
RUN pnpm add turbo@^2.5.8 --global
COPY . .
RUN turbo prune '@repo/web' --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS builder
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=prepare /app/out/json/ .
RUN pnpm install

# Build the project and its dependencies
COPY --from=prepare /app/out/full/ .

RUN pnpm turbo build

FROM base AS dev
WORKDIR /app

COPY --from=builder /app .

CMD ["pnpm", "--filter=web", "dev"]
