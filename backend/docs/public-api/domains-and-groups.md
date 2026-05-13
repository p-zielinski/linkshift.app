# Domains and Domain Groups API

These endpoints define the domain topology where redirect logic runs.

## Domain Groups

Base path: `/api/v1/domain-groups`

### List groups
- `GET /api/v1/domain-groups`

### Create group
- `POST /api/v1/domain-groups`
- Body:

```json
{
  "name": "Production",
  "robotsPolicy": "NONE",
  "customRobotsContent": null
}
```

### Get one group
- `GET /api/v1/domain-groups/:id`

### Update group
- `PUT /api/v1/domain-groups/:id`

### Delete group
- `DELETE /api/v1/domain-groups/:id`

Notes:
- Group ownership is enforced by organization context from API key.
- Soft-delete semantics are used internally.
- `robotsPolicy` supports: `NONE`, `ALLOW_ALL`, `DISALLOW_ALL`, `DISALLOW_BAD_BOTS`, `CUSTOM`.
- `customRobotsContent` is used only when `robotsPolicy` is `CUSTOM` (max 4096 chars).

## Domains

Base path: `/api/v1/domains`

### List domains
- `GET /api/v1/domains`

### Create domain
- `POST /api/v1/domains`
- Body:

```json
{
  "name": "example.com",
  "domainGroupId": "dmg_xxx"
}
```

### Get one domain
- `GET /api/v1/domains/:id`

### Update domain
- `PUT /api/v1/domains/:id`

### Delete domain
- `DELETE /api/v1/domains/:id`

Notes:
- Domain names are uniqueness-checked among active records.
- Group ownership and plan limits are validated on write operations.

## LinkShift Subdomains

Base path: `/api/v1/subdomains`

### List subdomains
- `GET /api/v1/subdomains`

### Create subdomain
- `POST /api/v1/subdomains`
- Body:

```json
{
  "name": "testing-for-abby",
  "domainGroupId": "dmg_xxx"
}
```

### Get one subdomain
- `GET /api/v1/subdomains/:id`

### Update subdomain
- `PUT /api/v1/subdomains/:id`

### Delete subdomain
- `DELETE /api/v1/subdomains/:id`

Notes:
- Subdomain `name` accepts only `[a-z0-9-]` and max 30 chars.
- Reserved names are blocked server-side (for example `support`, `docs`, `admin`).
- Group ownership and subdomain plan limits are validated on write operations.

## Organization

Base path: `/api/v1/organization`

### Get organization
- `GET /api/v1/organization`

### Get usage summary
- `GET /api/v1/organization/usage`
