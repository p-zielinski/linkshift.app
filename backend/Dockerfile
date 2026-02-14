FROM node:24-slim AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:24-slim AS build
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy node_modules from deps stage
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend

# Generate Prisma client and build the application
RUN npx prisma generate
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev

FROM node:24-slim AS runner
WORKDIR /app/backend

# Install openssl for runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/docker-entrypoint.sh ./

# Ensure entrypoint is executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]