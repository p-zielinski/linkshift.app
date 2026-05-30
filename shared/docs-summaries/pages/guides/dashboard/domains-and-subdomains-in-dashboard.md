---
source: shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md
generatedAt: 2026-05-30T06:59:55.837Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to manage custom domains and LinkShift starter subdomains within domain groups.

## What this doc covers
- **Before you start**: Requirements for using domains and subdomains.
- **Domains (`/domains`)**: Overview of managing custom domains.
  - List and filter domains.
  - Domain setup help.
  - Add a domain.
  - Edit or remove a domain.
- **Subdomains (`/subdomains`)**: Overview of managing LinkShift-hosted subdomains.
  - List and filter subdomains.
  - Create a subdomain.
  - Edit or delete a subdomain.
- **What you should see**: Expected outcomes after managing domains and subdomains.
- **Automate instead**: API endpoints for managing domains and subdomains.
- **Related**: Links to additional documentation.

## Key workflows and rules
### Adding a Domain
1. Select **Add domain**.
2. Enter the Fully Qualified Domain Name (FQDN) and choose a **Domain group**.
3. Select **Create** to save.
4. Follow any DNS or verification steps provided.

### Editing or Removing a Domain
- To **Edit**, select the domain and open the **Details** wizard.
- To **Delete**, confirm in the dialog titled **Delete domain**.

### Adding a Subdomain
1. Select **Add subdomain**.
2. Set the subdomain label and choose a **Domain group**.
3. Select **Create** to save.

### Editing or Deleting a Subdomain
- To **Edit**, use the same process as for domains.
- To **Delete**, confirm in the dialog titled **Delete subdomain**.

## Limits and constraints
- Custom domains must be fully qualified hostnames (e.g., `links.example.com`).
- Each domain is bound to one domain group.
- The **Domain group** filter is required when listing subdomains; there is no option for **All domain groups** on the subdomains page.

## Related docs and API areas
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- API endpoints:
  - `GET` / `POST` / `PUT` / `DELETE` `/api/v1/domains`
  - `GET` / `POST` / `PUT` / `DELETE` `/api/v1/subdomains`
