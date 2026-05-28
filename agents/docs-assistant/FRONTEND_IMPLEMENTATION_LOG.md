# Docs assistant — frontend implementation log

Progress and improvement ideas for the documentation AI chat (frontend + related config).

---

## Iteration 1 — Foundation, panel, full page (2026-05-28)

### Done

- **`DocsAssistantApiService`** — `POST /api/v1/public/docs/search` (optional `X-Turnstile-Token`) and `POST .../rate`.
- **`TurnstileService`** — loads Cloudflare Turnstile (invisible widget), exposes `requestToken()` when `APP_TURNSTILE_SITE_KEY` is set; dev works without key when backend-tools allows non-prod requests.
- **`APP_TURNSTILE_SITE_KEY`** — runtime config (`app-runtime-config`, `server.ts` `/runtime-config.js`, `app.config.server.ts`, `frontend/.env.example`).
- **CSP** — `challenges.cloudflare.com` in `script-src` and `frame-src` on the SSR server.
- **History** — `docs-assistant-history.storage.ts` (localStorage, max 20 threads, LRU trim) + unit tests.
- **Session** — `DocsAssistantSessionService` (threads, submit, rate, errors).
- **UI** — `app-docs-assistant`, sources parsed to `/docs/...` links, thumbs up/down, history drawer, page context chip.
- **Shell** — sidebar CTA „Ask docs” (see Iteration 1b; panel/FAB removed).
- **Route** — `/docs/assistant` (prerender), chat in main content column.
- **Privacy** — section on documentation assistant, processors (OpenAI, Cloudflare Turnstile), local history note.

### Improvement ideas (next iterations)

1. **Markdown answers** — render assistant replies with `app-markdown-renderer` (sanitized) instead of plain `pre-wrap` text.
2. **Streaming** — if backend adds SSE/streaming, show partial answers (larger UX win).
3. **Keyboard** — shortcuts on `/docs/assistant` (e.g. focus question field).
4. **Turnstile UX** — visible widget fallback when invisible fails; surface „bot check” copy from API `details`.
5. **Deep link** — `/docs/assistant?thread=<id>` to restore a thread from history.
6. **Analytics** — optional privacy-preserving events (open Ask docs, submit, rate) without question text.
7. **i18n** — if docs go multilingual, pass locale to API when supported.
8. **E2E** — smoke test with mocked tools API in CI.
9. **Supabase retention** — document server log retention in privacy policy once SQL TTL is defined.

---

## Iteration 1b — Sidebar entry, remove right panel (2026-05-28)

### Done

- Removed FAB and right slide-over panel (less visual noise).
- **Ask docs** moved to a dedicated CTA in the left sidebar.
- Chat only in main column at `/docs/assistant`.
- Context chip when navigating from another doc page (`router.state.pageContext`).
- Removed `panelOpen` / panel mode from session and component.

### Improvement ideas

- Same as Iteration 1 backlog (markdown, deep links, etc.).

---

## Iteration 1c — Sidebar AI visual (2026-05-28)

### Done

- **Ask docs** sidebar CTA: gradient **icon badge** (`auto_awesome` on brand gradient, white glyph).
- **AI** pill next to the title for quick scanning.
- Stronger card shadow / hover lift so the entry stands out from plain nav links.
- Hint copy shortened to „Answers from documentation” (AI already in badge + pill).

### Improvement ideas

- Optional subtle pulse on icon badge (respect `prefers-reduced-motion`).
- Custom SVG mark if Material `auto_awesome` feels too generic next to marketing.

---

## Iteration 2 — (planned)

- TBD based on feedback from Iteration 1.
