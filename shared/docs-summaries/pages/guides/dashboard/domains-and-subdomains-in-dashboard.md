---
source: shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md
generatedAt: 2026-06-03T16:57:50.171Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing domains and subdomains in the LinkShift dashboard, explaining how to attach custom domains and LinkShift starter subdomains to domain groups for redirect rules.

## What this doc covers
- **Domains**: Overview of managing custom domains in the dashboard.
- **List and filter**: Instructions on how to view and filter registered domains.
- **Domain setup help**: Guidance on configuring domain settings and DNS records.
- **Add a domain**: Steps to add a new custom domain to a domain group.
- **Edit or remove**: Instructions for editing or deleting existing domains.
- **Subdomains**: Overview of managing LinkShift-hosted subdomains.
- **List and filter**: Instructions on how to view and filter subdomains.
- **Create a subdomain**: Steps to add a new subdomain to a domain group.
- **Edit or delete**: Instructions for editing or deleting existing subdomains.
- **What you should see**: Expected outcomes after adding domains or subdomains.
- **Automate instead**: Reference to API documentation for automating domain and subdomain management.
- **Related**: Links to related documentation.

## Key workflows and rules
### Adding a Domain
1. Select **Add domain**.
2. Enter the Fully Qualified Domain Name (FQDN) and choose the **Domain group**.
3. Select **Create** to save.
4. Follow any DNS or verification steps as indicated in the UI.

### Editing or Deleting a Domain
- **Edit**: Opens the **Details** wizard for modifications.
- **Delete**: Confirm in the dialog titled **Delete domain** for permanent removal.

### Adding a Subdomain
1. Select **Add subdomain**.
2. Set the subdomain label and choose the **Domain group**.
3. Select **Create** to save.

### Editing or Deleting a Subdomain
- **Edit**: Opens the same options as for domains.
- **Delete**: Confirm in the dialog titled **Delete subdomain**.

## Limits and constraints
- Custom domains must be fully qualified hostnames (e.g., `links.example.com`).
- Each custom domain is bound to one domain group.
- The **Domain group** filter is required when listing subdomains; there is no option for "All domain groups" on the subdomains page.
- Deletion of domains and subdomains is permanent and requires confirmation.

## Related docs and API areas
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- Management API: `GET/POST/PUT/DELETE /api/v1/domains` and `/api/v1/subdomains` for programmatic management of domains and subdomains.
