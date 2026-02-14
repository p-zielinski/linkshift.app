#!/bin/sh
set -eu

load_secret() {
  secret_name="$1"
  env_name="$2"
  secret_file="/run/secrets/${secret_name}"

  if [ -f "$secret_file" ]; then
    current_value="$(printenv "$env_name" || true)"
    if [ -z "$current_value" ]; then
      export "$env_name=$(cat "$secret_file")"
    fi
  fi
}

load_secret "database_url" "DATABASE_URL"
load_secret "redis_password" "REDIS_PASSWORD"
load_secret "jwt_secret" "JWT_SECRET"
load_secret "jwt_refresh_secret" "JWT_REFRESH_SECRET"
load_secret "sentry_dsn" "SENTRY_DSN"
load_secret "lemon_squeezy_api_key" "LEMON_SQUEEZY_API_KEY"
load_secret "lemon_squeezy_webhook_secret" "LEMON_SQUEEZY_WEBHOOK_SECRET"
load_secret "zeptomail_api_key" "ZEPTOMAIL_API_KEY"
load_secret "web_risk_api_key" "WEB_RISK_API_KEY"

if [ -x "./node_modules/.bin/prisma" ] && [ -n "${DATABASE_URL:-}" ]; then
  ./node_modules/.bin/prisma migrate deploy
fi

exec "$@"
