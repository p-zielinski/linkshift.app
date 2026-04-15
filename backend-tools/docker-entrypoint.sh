#!/bin/sh
set -eu

load_secret() {
  secret_name="$1"
  env_name="$2"
  secret_file="/run/secrets/${secret_name}"

  if [ -f "$secret_file" ]; then
    val=$(cat "$secret_file" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    export "$env_name=$val"
    echo "Loaded secret: $secret_name"
  fi
}

load_secret "tools_redis_password" "REDIS_PASSWORD"
load_secret "sentry_dsn" "SENTRY_DSN"

exec "$@"
