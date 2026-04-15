# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.11-slim AS base
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY backend-tools/package.json ./backend-tools/
WORKDIR /app/backend-tools
RUN --mount=type=cache,target=/root/.bun/install/cache bun install

FROM base AS build
WORKDIR /app
COPY --from=deps /app/backend-tools/node_modules ./backend-tools/node_modules
RUN ln -s /app/backend-tools/node_modules /app/node_modules
COPY shared ./shared
COPY backend-tools ./backend-tools
WORKDIR /app/backend-tools
RUN bun run build
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --production

FROM oven/bun:1.3.11-slim AS runner
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend-tools
ENV NODE_ENV=production

COPY --from=build /app/backend-tools/dist ./dist
COPY --from=build /app/backend-tools/node_modules ./node_modules
COPY --from=build /app/backend-tools/package.json ./
COPY --from=build /app/backend-tools/docker-entrypoint.sh ./
COPY --from=build /app/shared /app/shared

RUN mkdir -p /app/backend-tools/node_modules/@shared \
  && ln -sfn /app/shared/models /app/backend-tools/node_modules/@shared/models

RUN chmod +x docker-entrypoint.sh \
  && chown -R bun:bun /app
USER bun

EXPOSE 3030
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun", "dist/main.js"]
