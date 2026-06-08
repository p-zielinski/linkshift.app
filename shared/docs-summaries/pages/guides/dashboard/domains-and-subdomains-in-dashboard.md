---
source: shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md
generatedAt: 2026-06-08T20:08:07.469Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who need guidance on managing domains and subdomains within the platform.

## What this doc covers
- **Domains**: Overview of managing custom domains in the dashboard.
- **Subdomains**: Overview of managing LinkShift starter subdomains.
- **Domain setup help**: Instructions for configuring domains with DNS guidance.
- **Adding, editing, and deleting domains and subdomains**: Step-by-step processes for managing domains and subdomains.
- **Table empty states**: Descriptions of what users see in various scenarios when no domains or subdomains are present.
- **Next steps**: Guidance on creating redirect rules and validating them.
- **Automate instead**: Reference to API documentation for automating domain and subdomain management.

## Key workflows and rules
### Domains
1. **List and Filter Domains**:
   - Select **Domains** in the sidebar.
   - Use the **Site** menu to select a specific site.
   - Navigate through pages using the footer paginator.

2. **Add a Domain**:
   - Click **Add domain**.
   - Enter the Fully Qualified Domain Name (FQDN) and select a **Domain group**.
   - Click **Create** to save and follow any DNS verification steps.

3. **Edit or Remove a Domain**:
   - **Edit**: Opens the **Details** wizard.
   - **Delete**: Confirm in the **Delete domain** dialog.

### Subdomains
1. **List and Filter Subdomains**:
   - Select **Subdomains** in the sidebar.
   - Use the **Site** menu to select a specific site.
   - Navigate through pages using the footer paginator.

2. **Create a Subdomain**:
   - Click **Add subdomain**.
   - Set the subdomain label and select a **Domain group**.
   - Click **Create** to save.

3. **Edit or Delete a Subdomain**:
   - Use row actions similar to domains.
   - Confirm deletion in the **Delete subdomain** dialog.

## Limits and constraints
- **View Restrictions**: Domains and subdomains are only accessible in **Advanced** view; **Campaign** view redirects to **Settings**.
- **Site Selection**: The **All sites** option is not available in the **Domains** and **Subdomains** sections in **Advanced** view.
- **Domain Group Requirement**: At least one domain group must exist before adding domains or subdomains.

## Related docs and API areas
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- Management API: 
  - `GET /api/v1/domains`
  - `POST /api/v1/domains`
  - `PUT /api/v1/domains`
  - `DELETE /api/v1/domains`
  - `GET /api/v1/subdomains`
  - `POST /api/v1/subdomains`
  - `PUT /api/v1/subdomains`
  - `DELETE /api/v1/subdomains`
