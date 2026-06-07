---
source: shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md
generatedAt: 2026-06-07T10:04:56.681Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing domains and subdomains in the LinkShift dashboard, explaining how to set up and manage these entities.

## What this doc covers
- **Domains**: Overview of managing custom domains.
- **Subdomains**: Overview of managing LinkShift starter subdomains.
- **List and filter**: Steps to list and filter domains and subdomains.
- **Domain setup help**: Guidance for configuring domains.
- **Add a domain**: Instructions for adding a new domain.
- **Edit or remove**: Steps for editing or deleting domains and subdomains.
- **Table empty states**: Descriptions of UI states when no domains or subdomains are present.
- **Next steps**: Guidance on creating redirect rules and validating them.
- **Automate instead**: Reference to API for automating domain and subdomain management.

## Key workflows and rules
### Domains
1. **List and filter**:
   - Select **Domains** in the sidebar.
   - Use the **Site** menu to select a site.
   - Use the footer paginator to navigate pages.

2. **Add a domain**:
   - Click **Add domain**.
   - Enter the Fully Qualified Domain Name (FQDN) and select a **Domain group**.
   - Click **Create** to save and follow any DNS or verification steps.

3. **Edit or remove**:
   - **Edit**: Click to open the **Details** wizard.
   - **Delete**: Confirm in the **Delete domain** dialog.

### Subdomains
1. **List and filter**:
   - Select **Subdomains** in the sidebar.
   - Use the **Site** menu to select a site.
   - Use the footer paginator to navigate pages.

2. **Create a subdomain**:
   - Click **Add subdomain**.
   - Set the subdomain label and select a **Domain group**.
   - Click **Create** to save.

3. **Edit or delete**:
   - Use row actions similar to **Domains**.
   - Confirm deletion in the **Delete subdomain** dialog.

## Limits and constraints
- **View Restrictions**: Domains and subdomains are only accessible in **Advanced** view; **Campaign** view redirects to **Settings** → **Domains & hosts**.
- **Site Selection**: The **All sites** option is not available in the **Advanced** view for listing domains and subdomains.
- **Domain Group Requirement**: At least one domain group must exist to attach domains or subdomains.

## Related docs and API areas
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- Management API endpoints: 
  - `GET /api/v1/domains`
  - `POST /api/v1/domains`
  - `PUT /api/v1/domains`
  - `DELETE /api/v1/domains`
  - `GET /api/v1/subdomains`
  - `POST /api/v1/subdomains`
  - `PUT /api/v1/subdomains`
  - `DELETE /api/v1/subdomains`
