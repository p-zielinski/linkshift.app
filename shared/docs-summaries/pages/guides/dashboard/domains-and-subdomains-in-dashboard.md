---
source: shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md
generatedAt: 2026-06-30T19:39:59.516Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing domains and subdomains in the LinkShift dashboard, explaining how to add, verify, and manage them.

## What this doc covers
- **Domains**: Overview of managing custom domains and their settings.
- **List and filter**: Instructions on how to view and filter domains.
- **Domain setup help**: Guidance for configuring domain DNS settings.
- **Add a domain**: Steps to add a new custom domain.
- **Verify DNS**: Process for verifying the DNS status of a domain.
- **Change group or delete**: Options for changing the domain group or deleting a domain.
- **Subdomains**: Overview of managing LinkShift starter subdomains.
- **Create a subdomain**: Steps to add a new subdomain.
- **Change group or delete**: Options for changing the subdomain group or deleting a subdomain.
- **Next steps**: Guidance on creating redirect rules and validating them.
- **Automate instead**: Reference to API documentation for automating domain management.

## Key workflows and rules
### Adding a Domain
1. Select **Add domain**.
2. Enter the Fully Qualified Domain Name (FQDN) and choose the **Domain group**.
3. Select **Create** to save.
4. The dashboard will display **Configure your domain** for DNS setup.

### Verifying DNS
1. If a domain is **Pending** or **Failed**, select the **Verify DNS** action (dns icon).
2. This triggers a `POST /api/v1/domains/:id/verify-dns` request.
3. UI feedback will indicate if the verification is successful or failed.

### Adding a Subdomain
1. Select **Add subdomain**.
2. Set the subdomain label and **Domain group**.
3. Select **Create** to save.

## Limits and constraints
- **Domain Groups**: At least one domain group must exist to manage domains and subdomains.
- **Domain Name**: Once deleted, a domain name is reserved for 7 days and cannot be reused immediately.
- **Subdomain Name**: Similar to domains, a deleted subdomain name is reserved for 7 days.
- **TLS Certificates**: New TLS certificates are required for custom domains but not for LinkShift subdomains.

## Related docs and API areas
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- API endpoints: 
  - `GET/POST/PUT/DELETE /api/v1/domains`
  - `POST /api/v1/domains/:id/verify-dns`
  - `POST /api/v1/subdomains`
