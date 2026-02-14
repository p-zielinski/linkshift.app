FROM node:24-slim AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY shared ./shared
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npx ng build --configuration production --no-budgets && npm prune --omit=dev

FROM node:24-slim AS runner
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY --from=build /app/frontend/node_modules ./node_modules
COPY --from=build /app/frontend/dist ./dist
COPY --from=build /app/frontend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/frontend/server/server.mjs"]
