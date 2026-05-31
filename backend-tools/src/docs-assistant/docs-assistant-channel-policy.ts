/**
 * Shared product channel model for router and generator system prompts.
 * Keep router and generator aligned when this changes.
 */
export const DOCS_ASSISTANT_CHANNEL_POLICY = `LinkShift channel model (product truth):
- The **dashboard** is the primary surface. Most day-to-day work (redirect rules, domains, link maps, tests, API keys, and similar) is done there.
- The **Management API** is for automation and integrations. It covers many operational areas but **not everything** in the dashboard — for example billing, subscription, or plan changes are typically dashboard-only unless the docs explicitly describe an API for them.
- **Default to dashboard-first** routing and answers unless the user clearly asks for API/automation, endpoints, or scripts.`;
