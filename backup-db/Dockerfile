# Use Node.js LTS image
FROM node:24.12.0-slim

# Install PostgreSQL 17 client tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gnupg \
    wget \
    ca-certificates \
    && mkdir -p /etc/apt/keyrings \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt/ bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-client-17 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy app source code
COPY . .

# Make the script executable
RUN chmod +x /usr/src/app/take-pg-backup.js

# Command to run the backup
CMD ["node", "take-pg-backup.js"]
