# backend-tools

Public tools backend for LinkShift (NestJS).

## Local run

```bash
cd backend-tools
cp .env.example .env
npm install
npm run start:dev
```

Server listens on `http://localhost:3030`.

You can also run without `.env` (defaults are applied), but `.env.example` is recommended.

If Redis is unavailable, public tools still work and rate limiting is temporarily skipped.

## Endpoints

- `GET /health`
- `GET /api/v1/public/qr-code`
- `GET /api/v1/public/trace` (single hop / single request result)
- `GET /trace` (single hop alias)
- `POST /api/v1/public/docs/search` — documentation assistant (`x-turnstile-token`, body `{ "question": "..." }`)
- `POST /api/v1/public/docs/rate` — feedback on a search (`{ "logId": "...", "rating": 1 | -1 | 0 }`)

See `agents/docs-assistant/README.md` for models, Supabase logging, and Turnstile setup.
