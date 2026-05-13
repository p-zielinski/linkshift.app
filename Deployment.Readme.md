# Deployment Guide (Docker Swarm)

This guide describes how to deploy infra/app/tools stacks, create secrets, and access services securely.

## Overview
- Infra stack: Caddy, Postgres, Redis, Loki, Promtail, Grafana, Dozzle
- App stack: Frontend, Backend, db-backup
- Tools infrastructure stack: caddy-tools, redis-tools, dozzle-tools
- Tools application stack: backend-tools
- Shared overlay network: `SWARM_OVERLAY_NETWORK`

## Prerequisites
- Docker Engine with Swarm mode initialized
- DNS entries (or internal DNS for VPN) for Caddy-routed services
- Access to the manager node (SSH)
- A VPN or private network for admin access

## Files
- `docker-stack.infra.yml`
- `docker-stack.app.yml`
- `docker-stack.tools.infa.yml`
- `docker-stack.tools.app.yml`
- `config/Caddyfile`
- `config/Caddyfile.tools`
- `config/dozzle.tools.users.yml.example`
- `deploy/stack.env.example` (copy to your env file)

## 1) Prepare environment variables
Create a stack env file:

```bash
cp deploy/stack.env.example deploy/stack.env
```

Edit `deploy/stack.env` and set:
- Image tags (backend/frontend/backend-tools)
- Hosts (frontend/grafana/dozzle + tools hostnames)
- Caddy ACME email
- App settings

Note:
- Internal service ports remain `5432` (Postgres) and `6379` (Redis).
- Published host ports are `5454` (Postgres) and `6767` (Redis) for SSH/VPN access.

## Caddy routing notes
- Infra Caddy issues TLS for `FRONTEND_HOST`, `GRAFANA_HOST`, and `DOZZLE_HOST`.
- Tools stack has its own Caddy (`config/Caddyfile.tools`) and issues TLS for `TOOLS_HOST` and `TOOLS_DOZZLE_HOST`.
- Catch-all traffic uses on-demand TLS and calls `GET /check-domain?domain=...` on the backend.
- Update `config/Caddyfile` or `config/Caddyfile.tools` depending on which stack owns the hostname.

## 2) Create the shared overlay network
Run on the manager node:

```bash
docker network create \
  --driver overlay \
  --attachable \
  ${SWARM_OVERLAY_NETWORK}
```

## 3) Create Docker secrets
All secrets are external, so create them once in the swarm.

Infra stack secrets:

```bash
printf "postgres-password" | docker secret create postgres_password -
printf "redis-password" | docker secret create redis_password -
printf "grafana-admin-password" | docker secret create grafana_admin_password -
```

App stack secrets:

```bash
printf "jwt-secret" | docker secret create jwt_secret -
printf "jwt-refresh" | docker secret create jwt_refresh_secret -
printf "sentry-dsn" | docker secret create sentry_dsn -
printf "paddle-key" | docker secret create paddle_api_key -
printf "paddle-webhook" | docker secret create paddle_webhook_secret -
printf "%s" "zeptomail-key" | docker secret create zeptomail_api_key -
printf "web-risk-browsing-api-key" | docker secret create web_risk_api_key -
```

Tools stacks secret:

```bash
printf "tools-redis-password" | docker secret create tools_redis_password -
```

Database URL secret for the backend (internal port 5432):

```bash
printf "postgresql://postgres:postgres-password@postgres:5432/linkshift?schema=public" | docker secret create database_url -
```

db-backup secrets:

```bash
printf "postgres-password" | docker secret create db-password -
printf "b2-key-id" | docker secret create backblaze-application-key-id -
printf "b2-key" | docker secret create backblaze-application-key -
```

If you already created a secret, remove and recreate it:

```bash
docker secret rm <secret-name>
```

## 4) Provision a dedicated 30 GB disk for Loki
This creates a hard size limit for logs.

1) Identify the new disk:

```bash
lsblk
```

Assume the new disk is `/dev/sdb`.

2) Create a single 30 GB partition (use `parted` or `fdisk`):

```bash
sudo parted /dev/sdb --script \
  mklabel gpt \
  mkpart primary ext4 1MiB 30GiB
```

3) Format it:

```bash
sudo mkfs.ext4 /dev/sdb1
```

4) Create a mountpoint and mount it:

```bash
sudo mkdir -p /mnt/loki
sudo mount /dev/sdb1 /mnt/loki
```

5) Persist it in `/etc/fstab`:

```bash
sudo blkid /dev/sdb1
```

Add a line like:

```
UUID=<your-uuid> /mnt/loki ext4 defaults,nofail 0 2
```

6) Set ownership so the container can write:

```bash
sudo chown 10001:10001 /mnt/loki
```

If Loki fails to write, check the container user ID and adjust ownership.

## 5) Deploy the infra stack
From the repo root on the manager node:

```bash
set -a
source deploy/stack.env
set +a

docker stack deploy \
  --with-registry-auth \
  -c docker-stack.infra.yml \
  ${INFRA_STACK_NAME}
```

## 6) Deploy the app stack
Optionally set a db-backup image tag:

```bash
export GIT_COMMIT_HASH=latest
```

Deploy:

```bash
set -a
source deploy/stack.env
set +a

docker stack deploy \
  --with-registry-auth \
  -c docker-stack.app.yml \
  ${APP_STACK_NAME}
```

## 7) Deploy the tools infrastructure stack

Before deploy, prepare Dozzle users file for tools stack:

```bash
cp config/dozzle.tools.users.yml.example config/dozzle.tools.users.yml
```

Edit `config/dozzle.tools.users.yml` and change the password.

Tools infra Caddy publishes ports `80/443`, so deploy tools infra stack on a separate VPS/swarm from the infra Caddy stack (or customize published ports if you intentionally run both on one host).

Deploy:

```bash
set -a
source deploy/stack.env
set +a

docker stack deploy \
  --with-registry-auth \
  -c docker-stack.tools.infa.yml \
  ${TOOLS_INFRA_STACK_NAME}
```

## 8) Deploy the tools application stack

Deploy:

```bash
set -a
source deploy/stack.env
set +a

docker stack deploy \
  --with-registry-auth \
  -c docker-stack.tools.app.yml \
  ${TOOLS_APP_STACK_NAME}
```

Notes:
- Deploy tools infra before tools app (it provides `redis-tools` and `caddy-tools`).
- `config/Caddyfile.tools` routes `TOOLS_HOST` to `backend-tools:3030`.
- `TOOLS_DOZZLE_HOST` is protected by `TOOLS_ADMIN_ALLOWLIST` and Dozzle simple auth users file.

Quick verify after deploy:

```bash
curl -I https://${TOOLS_HOST}/health
```

Dozzle usage (tools stack):
1. Open `https://${TOOLS_DOZZLE_HOST}` in browser.
2. Sign in with credentials from `config/dozzle.tools.users.yml`.
3. Filter services by `backend-tools`, `caddy-tools`, `redis-tools` to inspect runtime logs.

## 9) Verify stacks

```bash
docker stack services ${INFRA_STACK_NAME}
docker stack services ${APP_STACK_NAME}
docker stack services ${TOOLS_INFRA_STACK_NAME}
docker stack services ${TOOLS_APP_STACK_NAME}
```

## Secure access to Grafana, Dozzle, Loki, Promtail
Goal: restrict admin tools to VPN-only access and avoid exposing log endpoints publicly.

Recommended approach:
1) Keep Promtail internal (no published ports, no Caddy routing).
2) Access Loki through Grafana, or expose Loki through Caddy only to VPN CIDR.
3) Expose Grafana and Dozzle through Caddy with TLS and VPN-only access.
4) Add IP allowlisting and optional basic auth at the Caddy layer.

Practical options:
- VPN-only DNS: map `GRAFANA_HOST` and `DOZZLE_HOST` to private VPN IPs.
- Caddy IP filtering: allow only the VPN subnet.
- Dozzle: add basic auth to the Caddy route.
- Grafana: keep admin password strong and consider SSO.

Example Caddyfile snippet for VPN allowlist + basic auth:

```caddy
@vpn_only {
  remote_ip 10.8.0.0/24
}

grafana.example.com {
  basicauth {
    admin JDJhJDE0JHZibE9... # htpasswd hash
  }
  route @vpn_only {
    reverse_proxy grafana:3000
  }
}
```

## Dozzle simple auth
Dozzle uses the `simple` auth provider and reads users from:

```
config/dozzle.users.yml
```

Tools stack Dozzle uses:

```
config/dozzle.tools.users.yml
```

Expected format:

```yaml
users:
  admin:
    email: admin@example.com
    name: Admin
    password: change-me
```

Update the `password` there before deploying and redeploy the infra stack.
Update both files if you run both stacks.

When deploying through GitHub Actions, store the same YAML contents in repository secrets:
- `DOZZLE_USERS_YML` for `config/dozzle.users.yml`
- `DOZZLE_TOOLS_USERS_YML` for `config/dozzle.tools.users.yml`

If you need direct Loki access for troubleshooting, use a short-lived SSH tunnel:

```bash
ssh -L 3100:localhost:3100 user@your-server
```

## Secure access to Postgres and Redis
Published host ports:
- Postgres: 5454 (host) -> 5432 (container)
- Redis: 6767 (host) -> 6379 (container)

Use SSH tunneling (recommended) or restrict via firewall to VPN-only:

```bash
ssh -L 5454:localhost:5454 user@your-server
ssh -L 6767:localhost:6767 user@your-server
```

Firewall example (UFW, allow only VPN subnet 10.8.0.0/24):

```bash
ufw allow from 10.8.0.0/24 to any port 5454 proto tcp
ufw allow from 10.8.0.0/24 to any port 6767 proto tcp
```

## Loki log size control
Loki retention is time-based, not size-based. A hard cap comes from the disk size.

Actions to stay under ~30 GB:
- Keep the dedicated `/mnt/loki` partition at 30 GB.
- Start with `retention_period: 96h` (4 days) and adjust based on real usage.
- Reduce log volume at the source (Promtail filtering or app log levels).

To tune retention after a few days:

```bash
sudo du -sh /mnt/loki
```

Example adjustment if usage is too high:
- If `/mnt/loki` is ~10 GB after 4 days, keep 4 days.
- If `/mnt/loki` is ~20 GB after 4 days, set `retention_period: 96h`.

## VPN cost guidance (cheap)
Cheapest and simplest is usually a small self-hosted WireGuard server:
- 256 MB RAM is enough for a few users and low traffic.
- Gives you a static public IP from the VPS provider.
- Lets you allowlist the VPN subnet in Caddy and firewall rules.

If you already have a 256 MB VPS, it should be sufficient for VPN-only admin access.

## WireGuard example (cheap VPN)
This is a minimal example for a small admin-only VPN. Adjust IPs and keys as needed.

1) Install WireGuard:

```bash
sudo apt update
sudo apt install -y wireguard
```

2) Generate keys:

```bash
wg genkey | tee /etc/wireguard/server.key | wg pubkey > /etc/wireguard/server.pub
wg genkey | tee /etc/wireguard/client.key | wg pubkey > /etc/wireguard/client.pub
```

3) Server config `/etc/wireguard/wg0.conf`:

```
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <SERVER_PRIVATE_KEY>
PostUp = ufw route allow in on wg0 out on eth0
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = ufw route delete allow in on wg0 out on eth0
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <CLIENT_PUBLIC_KEY>
AllowedIPs = 10.8.0.2/32
```

4) Client config `client.conf`:

```
[Interface]
Address = 10.8.0.2/32
PrivateKey = <CLIENT_PRIVATE_KEY>
DNS = 1.1.1.1

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = <SERVER_PUBLIC_IP>:51820
AllowedIPs = 10.8.0.0/24
PersistentKeepalive = 25
```

5) Enable and start:

```bash
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

## Rollback
Redeploy with a previous image tag:

```bash
export BACKEND_IMAGE=ghcr.io/your-org/linkshift-backend:<tag>
export FRONTEND_IMAGE=ghcr.io/your-org/linkshift-frontend:<tag>

docker stack deploy -c docker-stack.app.yml ${APP_STACK_NAME}
```

## GitHub Actions (manual deployments from dashboard)
All deployment workflows are manual (`workflow_dispatch`) and run from the branch selected in the GitHub Actions dashboard (`Run workflow`).

Available workflows:
- `.github/workflows/deploy.yml` — builds backend/frontend/db-backup and deploys `docker-stack.app.yml`.
- `.github/workflows/deploy-infra.yml` — deploys `docker-stack.infra.yml` using `CADDY_IMAGE` from the selected tag input.
- `.github/workflows/deploy-tools-app.yml` — builds/pushes `backend-tools` and deploys `docker-stack.tools.app.yml`.
- `.github/workflows/deploy-tools-infra.yml` — deploys `docker-stack.tools.infa.yml` (including Redis).

Required GitHub Actions secrets:
- `STACK_ENV` — contents of your deploy env file (same format as `deploy/stack.env`).
- `DEPLOY_HOST` — IP or hostname of the Swarm manager.
- `DEPLOY_USER` — SSH user for deployment.
- `DEPLOY_SSH_PRIVATE_KEY` — SSH private key for deployment.
- `DEPLOY_REGISTRY_USER` — registry username for the server to pull images.
- `DEPLOY_REGISTRY_PASS` — registry token/password for the server to pull images.

Notes:
- Workflows use stack names from workflow `env` blocks:
  - `deploy.yml`: `linkshift-app`
  - `deploy-infra.yml`: `linkshift-infra`
  - `deploy-tools-app.yml`: `linkshift-tools-app`
  - `deploy-tools-infra.yml`: `linkshift-tools-infra`
- Build workflows overwrite image tags in `STACK_ENV` at deploy time:
  - `deploy.yml`: `BACKEND_IMAGE`, `FRONTEND_IMAGE`, `GIT_COMMIT_HASH`
  - `deploy-infra.yml`: `CADDY_IMAGE` (from workflow input `caddy_image_tag`)
  - `deploy-tools-app.yml`: `BACKEND_TOOLS_IMAGE`, `GIT_COMMIT_HASH`

Build/push infra Caddy image locally (recommended):

```bash
gh auth refresh -h github.com -s write:packages -s read:packages && OWNER="$(gh repo view --json owner -q '.owner.login')" && TAG="$(git rev-parse --short=12 HEAD)" && gh auth token | docker login ghcr.io -u "$OWNER" --password-stdin && docker buildx build --platform linux/arm64 -f config/Dockerfile.caddy --label org.opencontainers.image.source=https://github.com/p-zielinski/linkshift.app -t "ghcr.io/$OWNER/linkshift-caddy-cloudflare:latest" -t "ghcr.io/$OWNER/linkshift-caddy-cloudflare:$TAG" --push . && echo "OK: ghcr.io/$OWNER/linkshift-caddy-cloudflare:latest i :$TAG"
```

Then run `.github/workflows/deploy-infra.yml` and set `caddy_image_tag` to either:
- `latest`
- the printed git-based tag (for example `1d5e3cadad57`) to pin an exact image

## Prisma migrations on backend startup
The backend entrypoint runs Prisma migrations automatically if `DATABASE_URL` is set:

```
./node_modules/.bin/prisma migrate deploy
```
