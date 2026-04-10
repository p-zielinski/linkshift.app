#!/bin/sh
set -eu

# Function to load secrets from /run/secrets/ into environment variables
load_secret() {
  secret_name="$1"
  env_name="$2"
  secret_file="/run/secrets/${secret_name}"

  if [ -f "$secret_file" ]; then
    # Read the secret, trim whitespace, and export it
    val=$(cat "$secret_file" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    export "$env_name=$val"
    echo "Successfully loaded secret: $secret_name into $env_name"
  else
    echo "Warning: Secret file $secret_file not found."
  fi
}

# Load all required secrets
load_secret "database_url" "DATABASE_URL"
load_secret "redis_password" "REDIS_PASSWORD"
load_secret "jwt_secret" "JWT_SECRET"
load_secret "jwt_refresh_secret" "JWT_REFRESH_SECRET"
load_secret "sentry_dsn" "SENTRY_DSN"
load_secret "lemon_squeezy_api_key" "LEMON_SQUEEZY_API_KEY"
load_secret "lemon_squeezy_webhook_secret" "LEMON_SQUEEZY_WEBHOOK_SECRET"
load_secret "zeptomail_api_key2" "ZEPTOMAIL_API_KEY"
load_secret "web_risk_api_key" "WEB_RISK_API_KEY"

# Run Prisma migrations if DATABASE_URL is available
if [ -n "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL detected. Generating lean prisma.config.js..."

  # Generate a pure CommonJS config file without external imports
  # We place it in the root and/or the prisma folder to be sure
  cat <<EOF > prisma.config.js
module.exports = {
  datasource: {
    url: \`${DATABASE_URL}\`
  }
};
EOF

  # Copy to prisma folder as well, just in case Prisma 7-dev looks there
  cp prisma.config.js prisma/prisma.config.js

  echo "Running Prisma migrations..."
  bun x prisma migrate deploy
else
  echo "Error: DATABASE_URL is not set. Prisma migrations skipped."
fi

# Execute the main container command (from CMD)
exec "$@"
