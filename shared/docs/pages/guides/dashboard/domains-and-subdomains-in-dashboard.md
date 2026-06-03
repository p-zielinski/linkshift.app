# Domains and subdomains in the dashboard

Attach custom domains and LinkShift starter subdomains to a domain group so redirect rules can run on those hosts.

:::info
You need at least one domain group first — see [Domain groups in the dashboard](./domain-groups-in-dashboard.md). For the fastest test host, use **Subdomains** → **Add subdomain**; use **Domains** when your custom DNS is ready.
:::

## Domains

In the sidebar, select **Domains**. The page title is **Domains** (*Registered hostnames available for redirect routing.*).

Custom domains are fully qualified hostnames (for example `links.example.com`) bound to one domain group.

### List and filter

1. Select **Domains** in the sidebar.
2. Use the **Domain group** filter (and **All domain groups** when you have more than one).
3. Search or paginate the table as needed.

### Domain setup help

Select **Domain setup** to open **Configure your domain** — DNS target IP and A record guidance for your provider.

### Add a domain

1. Select **Add domain**.
2. In the **Details** step (**Domain details**), enter the FQDN and choose the **Domain group**.
3. On the last step, select **Create** to save.

Follow any DNS or verification steps shown in the UI or your provider; the dashboard reflects attachment status in the table.

### Edit or remove

- **Edit** — opens the same **Details** wizard.
- **Delete** — confirm in the dialog titled **Delete domain** (permanent removal from the group).

## Subdomains

In the sidebar, select **Subdomains**. The page title is **Subdomains** (*LinkShift-hosted subdomains mapped to your domain groups.*).

Starter subdomains use your organization’s LinkShift host pattern. The **Base Routing Host** card shows the base host and how names resolve as `{name}.{base}`.

### List and filter

1. Select **Subdomains** in the sidebar.
2. Choose a **Domain group** in the filter (required — there is no **All domain groups** option on this page).

### Create a subdomain

1. Select **Add subdomain**.
2. In the **Details** step (**Subdomain details**), set the subdomain label and **Domain group**.
3. On the last step, select **Create** to save.

The table shows the full host (for example `campaign.linkshift.app`).

### Edit or delete

Use row actions the same way as on **Domains**. Delete confirms in a dialog titled **Delete subdomain**.

## What you should see

- New rows in the **Domains** or **Subdomains** table tied to the chosen domain group.
- Hostnames available when you create redirect rules and tests for that group.

**Next in the dashboard:** create a redirect rule for those hosts ([Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)), then validate with **Run tests** or **Fetch expected result** ([Tests in the dashboard](./tests-in-dashboard.md)).

## Automate instead

See [Domains and domain groups (API)](../domains-and-groups.md) for custom domains and LinkShift subdomains.

:::ai-only
Management API: GET/POST/PUT/DELETE `/api/v1/domains` and `/api/v1/subdomains`.
:::

## Related

- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
