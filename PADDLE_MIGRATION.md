# Migracja billingowa: Paddle (overlay) dla LinkShift

Status kodu: zaktualizowano backend + frontend pod checkout overlay przez Paddle.js.

## Co działa po migracji
- Checkout odbywa się jako overlay (`Paddle.Checkout.open`) wewnątrz aplikacji.
- Nie ma już redirectu na `checkoutUrl` po rejestracji i w dialogu upgrade.
- Ceny planów (`Basic/Pro`, `monthly/yearly`) są pobierane z Paddle Prices API przez backend (`/api/v1/billing/plans`).
- Webhooki Paddle aktualizują subskrypcję organizacji na podstawie `customData` + danych eventu.
- Dashboard ma rozdzielone akcje:
  - `Manage subscription` -> portal zarządzania,
  - `Cancel subscription` -> flow anulowania (osobna akcja + potwierdzenie).
- Na frontendzie jest informacja, że ceny zawierają podatek i że hosting jest w UE.

## Gdzie odbywa się checkout
Checkout uruchamia się jako overlay na stronach aplikacji:
- rejestracja (`/auth`) dla płatnego planu,
- upgrade z dashboardu (dialog planów).

Nie jest wymagana dedykowana strona checkoutu. Klient zostaje w aplikacji, a Paddle renderuje własny overlay.

## Aktualny flow płatności
1. Użytkownik wybiera plan i interwał (`BASIC/PRO`, `MONTHLY/YEARLY`).
2. Frontend bierze odpowiadający `priceId` z katalogu planów (`/api/v1/billing/plans`).
3. Frontend otwiera overlay przez `PaddleCheckoutService`.
4. Do `customData` trafiają minimum:
   - `organizationId`
   - `userId`
   - `email`
   - `plan`
   - `interval`
5. Paddle wysyła webhook.
6. Backend weryfikuje podpis webhooka i aktualizuje subskrypcję organizacji.

## Webhooki Paddle
Endpoint:
- `POST /api/v1/billing/webhooks/paddle`

Weryfikacja:
- nagłówek `paddle-signature`
- sekret: `PADDLE_WEBHOOK_SECRET`

Zalecane eventy do włączenia w Paddle:
- `subscription.created`
- `subscription.updated`
- `subscription.resumed`
- `subscription.paused`
- `subscription.canceled`
- `transaction.paid`
- `transaction.payment_failed`

## Portal subskrypcji (manage/cancel)
Endpoint frontendowy:
- `GET /api/v1/billing/portal?action=manage`
- `GET /api/v1/billing/portal?action=cancel`

Logika backendu:
- `action=manage` preferuje URL do zarządzania płatnością.
- `action=cancel` preferuje URL anulowania.
- Jeśli brakuje URL-i, backend próbuje fallback przez sesję customer portal.

## Zmienne środowiskowe

### Backend (wymagane)
- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_SUCCESS_URL`
- `PADDLE_PRICE_BASIC_MONTHLY_ID`
- `PADDLE_PRICE_BASIC_YEARLY_ID`
- `PADDLE_PRICE_PRO_MONTHLY_ID`
- `PADDLE_PRICE_PRO_YEARLY_ID`

### Frontend runtime (wymagane dla overlay)
- `APP_PADDLE_CLIENT_TOKEN`
- `APP_PADDLE_ENV` (`sandbox` albo `live`)

## Paddle checkout settings
W kodzie frontendu checkout otwierany jest jako:
- `displayMode: 'overlay'`
- `variant: 'multi-page'`

## CSP i bezpieczeństwo frontendu
Dla overlay checkout frontend SSR serwer dopuszcza:
- `script-src` z `https://cdn.paddle.com`
- `frame-src` dla domen checkout Paddle
- `connect-src` dla endpointów Paddle

## Mapowanie planów na ID (uzupełniasz swoimi ID)
- Basic Monthly -> `PADDLE_PRICE_BASIC_MONTHLY_ID`
- Basic Yearly -> `PADDLE_PRICE_BASIC_YEARLY_ID`
- Pro Monthly -> `PADDLE_PRICE_PRO_MONTHLY_ID`
- Pro Yearly -> `PADDLE_PRICE_PRO_YEARLY_ID`

## Sandbox: plan testów lokalnych
1. Ustaw `APP_PADDLE_ENV=sandbox` i token `APP_PADDLE_CLIENT_TOKEN=test_...`.
2. Ustaw backendowe `PADDLE_PRICE_*` na sandboxowe `priceId`.
3. Otwórz `/auth`, wybierz plan płatny i potwierdź, że pojawia się overlay.
4. Wykonaj testową płatność kartą Paddle sandbox (`4242 4242 4242 4242`).
5. Zweryfikuj webhook w logach backendu i aktualizację planu na dashboardzie.
6. Sprawdź `Manage subscription` (portal manage).
7. Sprawdź `Cancel subscription` (potwierdzenie + portal cancel).

## Lista kontrolna (final)
- [x] Checkout przez Paddle.js overlay (bez redirect flow)
- [x] Rejestracja nie zwraca/nie używa `checkoutUrl`
- [x] Upgrade dialog używa overlay
- [x] Dashboard rozdziela manage vs cancel
- [x] Frontend runtime ma `APP_PADDLE_CLIENT_TOKEN` i `APP_PADDLE_ENV`
- [x] CSP dopuszcza Paddle overlay
- [x] Ceny pobierane z Paddle API
- [x] Komunikat „prices include taxes”
- [x] Komunikat o hostingu w UE + informacja o możliwym opóźnieniu poza UE
