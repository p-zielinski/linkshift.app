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

The table includes a **DNS** column with status pills: **Pending**, **Verified**, or **Failed**. Hover for guidance on pointing your A record at the LinkShift target IP.

### Domain setup help

Select **Domain setup** to open **Configure your domain** — DNS target IP and A record guidance for your provider.

### Add a domain

1. Select **Add domain**.
2. In the **Details** step (**Domain details**), enter the FQDN and choose the **Domain group**.
3. On the last step, select **Create** to save.

After create, the dashboard opens **Configure your domain** (DNS target IP and A record guidance) and shows a snackbar: *Domain added. Point DNS to the target IP, then verify when ready.*

New domains appear in the table with **DNS: Pending** until verification succeeds.

### Verify DNS

When a domain is **Pending** or **Failed**, a row action **Verify DNS** (dns icon) appears. Select it to call `POST /api/v1/domains/:id/verify-dns`:

| Result | UI feedback |
|--------|-------------|
| Verified | Snackbar: *DNS verified. Redirects are ready for this domain.* |
| Failed | Snackbar with link to **Domain setup** — ensure the A record points at the target IP |

The **Verify DNS** button is hidden once status is **Verified**. Use **Domain setup** in the page header anytime for DNS instructions.

### Change group or delete

- **Verify DNS** (row action, when Pending or Failed) — triggers a live DNS check; see [Verify DNS](#verify-dns) above.
- **Change group** (row action) — opens **Change domain group**. The domain name is read-only; only the **Domain group** field can be updated. To use a different hostname, delete this domain and add a new one (a new TLS certificate is required for custom domains).
- **Delete** — confirm in the dialog titled **Delete domain**. The warning explains that published short links on this domain will stop working, you should update DNS records, the name is **reserved for 7 days** and cannot be reused immediately, and adding a replacement domain requires a new TLS certificate.

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

### Change group or delete

- **Change group** (row action) — opens **Change subdomain group**. The subdomain label is read-only; only the **Domain group** field can be updated. Moving the group changes which redirect rules apply for this host.
- **Delete** — confirm in the dialog titled **Delete subdomain**. The warning explains that published short links on this host will stop working and the name is **reserved for 7 days** and cannot be reused immediately.

LinkShift subdomains use wildcard TLS (`*.linkshift.app`) — deleting or creating a subdomain does not trigger a new certificate per label. See [Hostname lifecycle](../domains-and-groups.md#hostname-lifecycle) for API details.

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
Management API: GET/POST/PUT/DELETE `/api/v1/domains`, POST `/api/v1/domains/:id/verify-dns`, and `/api/v1/subdomains`. Domains/Subdomains empty states may quote *choose All sites* in shared copy even though All sites is Links-only — switch site in the header menu instead.
:::

## Related

- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
