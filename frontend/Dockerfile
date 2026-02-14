FROM node:24.12.0-slim AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:24.12.0-slim AS build
WORKDIR /app

# Build-time defaults for runtime config (can be overridden at deploy)
ARG APP_API_BASE_URL
ARG APP_SITE_NAME
ARG APP_SITE_TAGLINE
ARG APP_SUPPORT_EMAIL
ARG APP_LEGAL_NAME
ARG APP_LEGAL_ADDRESS
ARG APP_PRIVACY_EMAIL
ARG APP_MIN_AGE
ARG APP_LEGAL_VERSION
ARG APP_AUTH_GATE_ENABLED

# Copy node_modules from deps stage
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code including shared directory
COPY shared ./shared
COPY frontend ./frontend
RUN ln -sfn /app/frontend/node_modules /app/node_modules

WORKDIR /app/frontend
RUN npm run build && npm prune --omit=dev

FROM node:24.12.0-slim AS runner
WORKDIR /app/frontend

ENV NODE_ENV=production
ARG APP_API_BASE_URL
ARG APP_SITE_NAME
ARG APP_SITE_TAGLINE
ARG APP_SUPPORT_EMAIL
ARG APP_LEGAL_NAME
ARG APP_LEGAL_ADDRESS
ARG APP_PRIVACY_EMAIL
ARG APP_MIN_AGE
ARG APP_LEGAL_VERSION
ARG APP_AUTH_GATE_ENABLED
ENV APP_API_BASE_URL=${APP_API_BASE_URL}
ENV APP_SITE_NAME=${APP_SITE_NAME}
ENV APP_SITE_TAGLINE=${APP_SITE_TAGLINE}
ENV APP_SUPPORT_EMAIL=${APP_SUPPORT_EMAIL}
ENV APP_LEGAL_NAME=${APP_LEGAL_NAME}
ENV APP_LEGAL_ADDRESS=${APP_LEGAL_ADDRESS}
ENV APP_PRIVACY_EMAIL=${APP_PRIVACY_EMAIL}
ENV APP_MIN_AGE=${APP_MIN_AGE}
ENV APP_LEGAL_VERSION=${APP_LEGAL_VERSION}
ENV APP_AUTH_GATE_ENABLED=${APP_AUTH_GATE_ENABLED}

# Copy built application and node_modules
COPY --from=build /app/frontend/node_modules ./node_modules
COPY --from=build /app/frontend/dist ./dist
COPY --from=build /app/frontend/package.json ./package.json

EXPOSE 4000

# Angular SSR server entrypoint
CMD ["node", "dist/frontend/server/server.mjs"]
