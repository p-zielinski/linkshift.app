FROM node:24.12.0-slim AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:24.12.0-slim AS build
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code including shared directory
COPY shared ./shared
COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm run build && npm prune --omit=dev

FROM node:24.12.0-slim AS runner
WORKDIR /app/frontend

ENV NODE_ENV=production

# Copy built application and node_modules
COPY --from=build /app/frontend/node_modules ./node_modules
COPY --from=build /app/frontend/dist ./dist
COPY --from=build /app/frontend/package.json ./package.json

EXPOSE 4000

# Angular SSR server entrypoint
CMD ["node", "dist/frontend/server/server.mjs"]
