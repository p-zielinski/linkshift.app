---
source: shared/docs/pages/guides/dashboard/domains-and-subdomains-in-dashboard.md
generatedAt: 2026-06-27T00:00:00.000Z
model: manual
---

## Purpose
This document is for users of the LinkShift dashboard who need guidance on managing domains and subdomains within the platform, including DNS verification status and actions.

## What this doc covers
- **Domains**: Overview of managing custom domains in the dashboard.
- **DNS column and Verify DNS**: Status pills (Pending / Verified / Failed) and manual verification action.
- **Subdomains**: Overview of managing LinkShift starter subdomains.
- **Domain setup help**: Instructions for configuring domains with DNS guidance.
- **Adding, changing group, and deleting domains and subdomains**: Step-by-step processes; hostnames are immutable after creation.
- **Table empty states**: Descriptions of what users see in various scenarios when no domains or subdomains are present.
- **Next steps**: Guidance on creating redirect rules and validating them.
- **Automate instead**: Reference to API documentation for automating domain and subdomain management.

## Key workflows and rules
### Domains
1. **List and Filter Domains**:
   - Select **Domains** in the sidebar.
   - Use the **Site** menu to select a specific site.
   - Navigate through pages using the footer paginator.
   - **DNS column** shows Pending, Verified, or Failed status pills.

2. **Add a Domain**:
   - Click **Add domain**.
   - Enter the Fully Qualified Domain Name (FQDN) and select a **Domain group**.
   - Click **Create** to save.
   - **Configure your domain** dialog opens; snackbar prompts to point DNS and verify.

3. **Verify DNS**:
   - Row action **Verify DNS** (dns icon) when status is Pending or Failed.
   - Success snackbar: *DNS verified. Redirects are ready for this domain.*
   - Failure snackbar links to **Domain setup**.

4. **Change group or delete a Domain**:
   - **Change group**: Row action opens **Change domain group**; name is read-only.
   - **Delete**: Confirm in **Delete domain** dialog — warns about broken short links, DNS updates, 7-day name reservation, and new TLS cert for replacements.

### Subdomains
1. **List and Filter Subdomains**:
   - Select **Subdomains** in the sidebar.
   - Use the **Site** menu to select a specific site.
   - Navigate through pages using the footer paginator.

2. **Create a Subdomain**:
   - Click **Add subdomain**.
   - Set the subdomain label and select a **Domain group**.
   - Click **Create** to save.

3. **Change group or delete a Subdomain**:
   - **Change group**: Row action opens **Change subdomain group**; label is read-only.
   - **Delete**: Confirm in **Delete subdomain** dialog — warns about broken short links and 7-day name reservation.

## Limits and constraints
- **View Restrictions**: Domains and subdomains are only accessible in **Advanced** view; **Campaign** view redirects to **Settings**.
- **Site Selection**: The **All sites** option is not available in the **Domains** and **Subdomains** sections in **Advanced** view.
- **Domain Group Requirement**: At least one domain group must exist before adding domains or subdomains.
- **Immutable hostnames**: Domain names and subdomain labels cannot be changed after creation; use **Change group** to move between groups.
- **DNS verification**: Custom domains only; subdomains use wildcard TLS without DNS checks.
- **Delete warnings**: 7-day global name reservation; custom domain delete also mentions DNS and TLS.

## Related docs and API areas
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- Management API: 
  - `GET /api/v1/domains`
  - `POST /api/v1/domains`
  - `POST /api/v1/domains/:id/verify-dns`
  - `PUT /api/v1/domains`
  - `DELETE /api/v1/domains`
  - `GET /api/v1/subdomains`
  - `POST /api/v1/subdomains`
  - `PUT /api/v1/subdomains`
  - `DELETE /api/v1/subdomains`
