# Domains and subdomains in the dashboard

**Advanced** view only. **Domains** and **Subdomains** are not available in **Campaign** view — visiting those routes redirects you to **Settings** → **Domains & hosts** (`/settings#hosts`). In **Campaign**, manage hosts from **Settings** or the connect-domain wizard.

Attach custom domains and LinkShift starter subdomains to a domain group so redirect rules can run on those hosts.

:::info
You need at least one domain group first — see [Domain groups in the dashboard](./domain-groups-in-dashboard.md). For the fastest test host, use **Subdomains** → **Add subdomain**; use **Domains** when your custom DNS is ready.
:::

## Domains

In the sidebar, select **Domains**.

Custom domains are fully qualified hostnames (for example `links.example.com`) bound to one domain group.

### List and filter

1. Select **Domains** in the sidebar.
2. Use the **Site** menu in the page header to pick one site at a time (**All sites** is not available on this page in **Advanced** view).
3. Use the footer paginator to change pages.

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

### Table empty states

| State | What you see |
|-------|----------------|
| Loading | **Loading domains…** |
| No domains in org | **No domains yet** with **Add domain** |
| Site selected, no domains here but other sites have domains | **No domains in this site** — switch site in the page header **Site** menu |

## Subdomains

In the sidebar, select **Subdomains**.

Starter subdomains use your organization’s LinkShift host pattern. The **Base Routing Host** card shows the base host, notes that dynamically created subdomains resolve under that host, and the resolution format `{name}.{base}`.

### List and filter

1. Select **Subdomains** in the sidebar.
2. Use the **Site** menu in the page header to pick one site at a time (**All sites** is not available on this page in **Advanced** view).
3. Use the footer paginator to change pages.

### Create a subdomain

1. Select **Add subdomain**.
2. In the **Details** step (**Subdomain details**), set the subdomain label and **Domain group**.
3. On the last step, select **Create** to save.

The table shows the full host (for example `campaign.linkshift.app`).

### Edit or delete

Use row actions the same way as on **Domains**. Delete confirms in a dialog titled **Delete subdomain**.

### Table empty states

| State | What you see |
|-------|----------------|
| Loading | **Loading subdomains…** |
| No subdomains in org | **No subdomains yet** with **Add subdomain** |
| Site selected, no subdomains here but other sites have subdomains | **No subdomains in this site** — switch site in the page header **Site** menu |

## Next steps

Create a redirect rule for those hosts ([Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)), then validate with **Run tests** or **Fetch expected result** ([Tests in the dashboard](./tests-in-dashboard.md)).

## Automate instead

See [Domains and domain groups (API)](../domains-and-groups.md) for custom domains and LinkShift subdomains.

:::ai-only
Management API: GET/POST/PUT/DELETE `/api/v1/domains` and `/api/v1/subdomains`. Domains/Subdomains empty states may quote *choose All sites* in shared copy even though All sites is Links-only — switch site in the header menu instead.
:::

## Related

- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
