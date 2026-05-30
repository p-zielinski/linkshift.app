# Domain groups in the dashboard

Create and manage domain groups—the containers that hold domains, subdomains, redirect rules, link maps, and tests.

## Before you start

- Sign in to the dashboard.
- You do not need an existing domain group to open **Domain Groups**.

## List domain groups

1. In the sidebar, select **Domain Groups** (`/domain-groups`). The page title is **Domain Groups**.
2. Review the table: group name, domain count, and row actions.

Use the table footer to change page size (10, 20, or 50) or move between pages.

## Create a domain group

1. On **Domain Groups**, select **Add group**.
2. Step **Details** (**Domain group details**) — enter a name.
3. Step **Robots.txt** (**Robots.txt policy**) — choose a policy:
   - Do not use (None)
   - Allow all
   - Disallow all
   - Disallow bad bots
   - Custom (paste robots.txt content within the allowed length)
4. On the last step, select **Create** to save the group.

## Edit a domain group

1. In the table row, open the edit action.
2. Walk through **Details** and **Robots.txt** with the current values.
3. Save your changes.

## Delete a domain group

1. In the table row, open the delete action.
2. Confirm in the dialog titled **Delete domain group** (permanent delete).

Removing a group affects domains and redirect resources tied to it. Review dependents under **Domains**, **Redirect Rules**, and **Link Maps** first.

## What you should see

- The new group appears in the table with an updated domain count after you attach hosts.
- Sidebar items that required a domain group (for example **Redirect Rules**) become enabled.

**Next in the dashboard:** attach at least one domain or subdomain in that group ([Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)), then create a redirect rule ([Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)).

## Automate instead

Domain groups are available via the Management API. See [Domains and domain groups](../domains-and-groups.md#domain-groups) for `GET` / `POST` / `PUT` / `DELETE` on `/api/v1/domain-groups`.

## Related

- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- [Dashboard overview](./dashboard-overview.md)
