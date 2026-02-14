FROM node:20-bookworm-slim AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/frontend/node_modules ./node_modules
COPY --from=build /app/frontend/dist ./dist
COPY --from=build /app/frontend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/frontend/server/server.mjs"]
