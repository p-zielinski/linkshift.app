# Domain groups in the dashboard

**Advanced** view only. Open **Domain Groups** from the sidebar under **Routing**.

In **Campaign** view, visiting `/domain-groups` redirects to **Settings** → **Domains & hosts** (`/settings#hosts`).

Create and manage domain groups — the containers that hold domains, subdomains, redirect rules, link maps, and tests. Sign in to the dashboard; you do not need an existing group to open **Domain Groups**.

## List domain groups

1. In the sidebar, select **Domain Groups**.
2. Review the table — name, ID, robots policy, domain count, and row actions. Use the footer paginator to change pages.

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

:::warning
Deleting a domain group is **permanent** and removes tied domains, rules, link maps, and tests. Review **Domains**, **Redirect Rules**, and **Link Maps** before you confirm **Delete domain group**.
:::

1. In the table row, open the delete action.
2. Confirm in the dialog titled **Delete domain group** (permanent delete).

## Next steps

Attach at least one domain or subdomain in the group ([Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)), then create a redirect rule ([Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)).

## Automate instead

Domain groups are available via the Management API. See [Domains and domain groups — Domain groups](../domains-and-groups.md#domain-groups).

:::ai-only
Management API: GET/POST/PUT/DELETE `/api/v1/domain-groups`.
:::

## Related

- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- [Dashboard overview](./dashboard-overview.md)
