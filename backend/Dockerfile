# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.11-slim AS base
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY backend/package.json ./backend/
WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/backend/node_modules ./backend/node_modules
RUN ln -s /app/backend/node_modules /app/node_modules
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend
RUN bun x prisma generate
RUN bun run build
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile --production

FROM oven/bun:1.3.11-slim AS runner
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
ENV NODE_ENV=production

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/docker-entrypoint.sh ./
COPY --from=build /app/shared /app/shared

RUN mkdir -p /app/backend/node_modules/@shared \
  && ln -sfn /app/shared/models /app/backend/node_modules/@shared/models \
  && ln -sfn /app/shared/prisma-client /app/backend/node_modules/@shared/prisma-client

RUN chmod +x docker-entrypoint.sh \
  && chown -R bun:bun /app
USER bun

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun", "dist/backend/src/main.js"]
