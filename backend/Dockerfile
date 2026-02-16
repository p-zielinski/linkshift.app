FROM node:24.12.0-slim AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:24.12.0-slim AS build
WORKDIR /app
ARG DATABASE_URL
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY shared ./shared
COPY backend ./backend
RUN ln -sfn /app/backend/node_modules /app/node_modules
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:24.12.0-slim AS runner
WORKDIR /app/backend
ARG DATABASE_URL
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

RUN echo "SPRAWDZAM ZAWARTOŚC FOLDERU DIST:" && ls -R ./dist
RUN echo "SPRAWDZAM GDZIE JEST main.js:" && find ./dist -name "main.js"

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "backend/src/main.js"]