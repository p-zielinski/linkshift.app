# Migracja billingu: LemonSqueezy -> Paddle (LinkShift)

Status: wykonane w kodzie (backend + frontend + deploy + dokumentacja)

## Zakres migracji
- Usunięto integrację LemonSqueezy z backendu i frontendu.
- Dodano nową integrację Paddle (checkout, webhooki, portal klienta, katalog cen).
- API billingowe zostało przestawione z `variantId` na `priceId`.
- Frontend został zaktualizowany do `priceId`.
- Dodano komunikaty na frontendzie:
  - ceny zawierają podatek,
  - LinkShift jest hostowany w UE, z możliwością kontaktu ws. innych regionów (poza UE może być nieco wolniej).
- Brak migracji klientów: niepotrzebne (potwierdzone: brak klientów).

## Co zostało zmienione w kodzie

### Backend
- Nowy serwis Paddle: `backend/src/billing/paddle.service.ts`
  - tworzenie checkoutu (Paddle Transactions API),
  - pobieranie subskrypcji,
  - pobieranie cen (`/prices/{price_id}`),
  - tworzenie sesji portalu klienta,
  - weryfikacja podpisu webhooka (`Paddle-Signature`, HMAC SHA-256).
- Usunięty serwis LemonSqueezy: `backend/src/billing/lemon-squeezy.service.ts`.
- `backend/src/billing/billing.service.ts`
  - migracja logiki billingowej na Paddle,
  - `variantId` -> `priceId`,
  - `provider: 'PADDLE'`,
  - katalog cen ładowany z Paddle Prices API,
  - obsługa eventów webhooków Paddle.
- `backend/src/api/billing.controller.ts`
  - webhook endpoint: `POST /api/v1/billing/webhooks/paddle`,
  - sygnatura z nagłówka `paddle-signature`,
  - checkout body: `priceId`.
- `backend/src/middleware/api-redirection.middleware.ts`
  - dev bypass webhooka przestawiony na `/api/v1/billing/webhooks/paddle`.
- `shared/models/organization-config.model.ts`
  - provider: `'PADDLE' | 'MANUAL' | null`.

### Frontend
- `frontend/src/app/core/api/billing-api.service.ts`
  - `createCheckout(priceId)` zamiast `createCheckout(variantId)`.
  - katalog planów zwraca `priceId`.
- `frontend/src/app/features/marketing/components/pricing-plans/*`
  - wybór planu emituje `priceId`,
  - dopisek: `Prices include applicable taxes.`
- `frontend/src/app/features/billing/upgrade-dialog/upgrade-dialog.component.ts`
  - checkout po `priceId`.
- `frontend/src/app/features/marketing/pages/pricing/pricing-page.component.html`
  - dopisek o podatku,
  - dopisek o hostingu w UE i kontakcie ws. innych regionów.
- Legal:
  - `frontend/src/app/features/legal/terms-page.component.html`
  - `frontend/src/app/features/legal/privacy-page.component.html`
  - Merchant of Record i płatności przepisane na Paddle.

### Konfiguracja / deploy
- `backend/.env.example` -> nowe zmienne Paddle.
- `backend/docker-entrypoint.sh` -> sekrety `paddle_api_key`, `paddle_webhook_secret`.
- `deploy/stack.env.example` -> nowe zmienne Paddle.
- `docker-stack.app.yml` -> env + secrets dla Paddle.
- `README.md`, `Deployment.Readme.md` -> instrukcje zaktualizowane na Paddle.

## Nowe zmienne środowiskowe
Wymagane:
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_SUCCESS_URL`
- `PADDLE_PRICE_BASIC_MONTHLY_ID`
- `PADDLE_PRICE_BASIC_YEARLY_ID`
- `PADDLE_PRICE_PRO_MONTHLY_ID`
- `PADDLE_PRICE_PRO_YEARLY_ID`

Opcjonalne:
- `PADDLE_API_VERSION`
- `PADDLE_API_BASE_URL` (domyślnie `https://api.paddle.com`)
- `PADDLE_WEBHOOK_TOLERANCE_SECONDS` (domyślnie `300`)

## Mapowanie ID planów (uzupełnij swoimi ID z Paddle)
- Basic Monthly -> `PADDLE_PRICE_BASIC_MONTHLY_ID`
- Basic Yearly -> `PADDLE_PRICE_BASIC_YEARLY_ID`
- Pro Monthly -> `PADDLE_PRICE_PRO_MONTHLY_ID`
- Pro Yearly -> `PADDLE_PRICE_PRO_YEARLY_ID`

## Webhook Paddle: jak skonfigurować
1. W Paddle utwórz endpoint webhooka:
   - URL: `https://<twoja-domena>/api/v1/billing/webhooks/paddle`
2. Skopiuj sekret endpointu webhooka do:
   - `PADDLE_WEBHOOK_SECRET`
3. Włącz eventy:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.resumed`
   - `subscription.paused`
   - `subscription.canceled`
   - `transaction.paid`
   - `transaction.payment_failed`
4. Upewnij się, że backend dostaje surowe body (w projekcie już jest).

## Uprawnienia klucza API Paddle
Minimalnie:
- Transactions: write
- Subscriptions: read
- Prices: read
- Customer portal sessions: write (zalecane, fallback do linku portalowego)

## Pricing: źródło cen
- Ceny planów są pobierane bezpośrednio z Paddle Prices API po `priceId`.
- Frontend używa `/api/v1/billing/plans`.
- Ceny nie są hardkodowane w frontendzie.

## Smoke test po wdrożeniu
1. Uzupełnij wszystkie `PADDLE_PRICE_*` i klucze/secrets.
2. Uruchom backend + frontend.
3. Wejdź na `/pricing` i sprawdź, czy ceny Basic/Pro (monthly/yearly) się ładują.
4. Wykonaj checkout Basic Monthly.
5. Sprawdź callback z `checkout_session` i status sesji checkout.
6. Sprawdź dashboard (plan, kwota, interwał, status).
7. Otwórz `Manage subscription` i sprawdź portal Paddle.
8. Zrób test webhooka z Paddle dashboard i sprawdź logi backendu.

## Checklist końcowy
- [x] Backend billing przepięty na Paddle
- [x] Frontend checkout przepięty na `priceId`
- [x] Endpoint webhooka Paddle wdrożony
- [x] Weryfikacja podpisu webhooka Paddle wdrożona
- [x] LemonSqueezy usunięty z kodu
- [x] Env/secrets/deploy przepisane
- [x] Pricing pobierany z provider API
- [x] Komunikat „ceny zawierają podatek” na frontendzie
- [x] Komunikat o hostingu UE + inne regiony na frontendzie
