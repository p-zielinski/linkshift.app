# LinkShift — System Integrity Audit (End-to-End)

**Date:** 2026-05-26  
**Scope:** Redirect engine vertical stack (Zod → `RuleValidatorService` → `RedirectService` → `LinkMapService`), hot-path resilience, unit-test fidelity, Opsec for analytics/simulate.  
**Method:** Static code review across `backend/src/` (no production traffic sampling).  
**Classification:** Internal only (`shared/not-public/`).

---

## 1. SYSTEM INTEGRITY SCORE

### **7 / 10**

**Rationale:** Core routing semantics (method matching, prefix boundaries, link-map skip/fallback, recursion limits, org-scoped analytics) are implemented consistently and covered by substantial tests. The stack is production-viable but **not a single source of truth**: validation is split across Zod, duplicated parser logic in `RuleValidatorService`, and runtime behavior in `RedirectService` with intentional divergence (e.g. unknown manipulators warn-at-runtime vs fail-at-save). The largest integrity gap is **unbounded user-controlled regex execution** on the hot path (ReDoS). Secondary gaps are schema/service drift (link-map rule constraints, destination URL rules) and incomplete test coverage for encoding edge cases and `multiply_10`.

---

## 2. KRYTYCZNE NIESPÓJNOŚCI (P0)

### P0-1 — Brak ochrony przed ReDoS na wzorcach regex (źródło reguły i operator `~=`)

**Ryzyko:** Użytkownik z uprawnieniami do API może zapisać regułę z katastrofalnym backtrackingiem. Kompilacja przechodzi w walidatorze (`new RegExp`), a wykonanie następuje przy **każdym** dopasowanym żądaniu (`String.match`, `RegExp.test`) bez limitu czasu ani złożoności.

**Walidacja przy zapisie** — kompiluje wzorzec, nie mierzy złożoności:

```91:96:backend/src/rule-validator/rule-validator.service.ts
    if (flagsAreValid) {
      const compiled = parseStoredRegexSource(source);
      if (compiled) {
        const capturingGroups = pattern.match(/(?<!\\)\((?!\?:)/g);
        return capturingGroups ? capturingGroups.length : 0;
```

**Runtime — dopasowanie źródła regex:**

```2804:2814:backend/src/redirect/redirect.service.ts
      if (rule.source instanceof RegExp) {
        const matchTarget =
          queryMatch === 'ignore'
            ? matchContext.path
            : matchContext.originalUrl;
        const match = matchTarget.match(rule.source);
        if (match) {
          isMatch = true;
          match.forEach((val, index) => {
            target = target.replace(new RegExp(`\\$${index}`, 'g'), val);
```

**Runtime — operator `~=` w warunkach:**

```3203:3218:backend/src/redirect/redirect.service.ts
      case '~=':
        try {
          let pattern = String(right);
          let flags = '';
          const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
          if (regexMatch) {
            pattern = regexMatch[1];
            flags = regexMatch[2];
          }
          return new RegExp(pattern, flags).test(String(left));
        } catch {
          return false;
        }
```

**Dowód braku mitigacji:** brak `safe-regex`, timeoutów, RE2, ani limitu długości wzorca poza ogólnym limitem `source` (16 384 znaków) — w repo nie występują odniesienia do ReDoS.

**Wpływ produkcyjny:** DoS pojedynczego workera Node przy trafieniu w regułę; reguła z błędem jest pomijana tylko gdy `processRule` łapie wyjątek — ReDoS zwykle **wisi**, nie rzuca.

---

### P0-2 — Reguła z `destination: null` i bez `linkMapId` może teoretycznie przejść do pustego przekierowania (brak constraint DB)

**Ryzyko:** API blokuje taki stan przy create/update, ale **Prisma nie wymusza** „destination XOR linkMap”. Dane spoza API (migracja, ręczny SQL, przyszły bug) → reguła pasuje ścieżkę, silnik zwraca pusty target.

**Schemat DB:**

```199:207:backend/prisma/schema.prisma
model RedirectRule {
  id            String   @id
  source        String
  destination   String?
  ...
  linkMapId     String?
```

**Silnik przy dopasowaniu:**

```2794:2842:backend/src/redirect/redirect.service.ts
      let target = rule.destination ?? '';
      ...
      if (!isMatch) return null;
      const resolvedTarget = this.replacePlaceholders(target, variables);
      return this.processConditionals(resolvedTarget);
```

**Mitigacja częściowa:** `createRule` / `updateRule` wymuszają destination gdy brak link map (`redirect.service.ts` ~1624–1631, 1720–1727). **Luka:** brak warstwy DB CHECK / trigger.

**Wpływ:** Pusty `Location` lub niepoprawny redirect — trudne do wykrycia w UI, bo lista reguł może pokazywać `destination: null`.

---

### P0-3 — `UpdateRedirectRuleSchema` nie egzekwuje wykluczenia linkMap/destination przy PATCH bez pola `linkMapId` (obchód intencji klienta)

**Ryzyko:** Klient z regułą link-map wysyła tylko `{ "destination": "https://evil.com" }` — Zod **przepuszcza** (superRefine uruchamia się tylko gdy `linkMapId !== undefined`):

```125:146:backend/src/zod-schames/redirect-rule.schemas.ts
  .superRefine((data, ctx) => {
    if (data.linkMapId !== undefined) {
      if (data.linkMapId) {
        if (data.destination !== undefined && data.destination !== null) {
          ctx.addIssue({ ... });
        }
        return;
      }
      ...
    }
  });
```

**Serwis ratuje spójność danych** (cicha nullifikacja — nie błąd dla użytkownika):

```1772:1775:backend/src/redirect/redirect.service.ts
    if (data.destination !== undefined) {
      updateData.destination = hasLinkMap ? null : (data.destination as string);
    } else if (hasLinkMap && existing.destination !== null) {
      updateData.destination = null;
```

**Wpływ:** Brak wycieku danych, ale **fałszywe poczucie sukcesu API** (200 + destination nadal null). To niespójność kontraktu API vs Zod, nie bypass routingu.

---

## 3. DŁUG TECHNICZNY I USPRAWNIENIA (P1 / P2)

### ETAP 1 — Vertical alignment (Zod ↔ walidator ↔ serwisy)

| Obszar | Ocena | Szczegóły |
|--------|--------|-----------|
| **matchMethod: `[]` = wszystkie metody** | ✅ Spójne | Zod default `[]`; silnik `isMethodMatch` zwraca `true` gdy pusta tablica (`redirect.service.ts` 2738–2741). Zod blokuje duplikaty i pełny zestaw metod (max N−1 jawnych). |
| **Status HTTP 301/302/307/308** | ✅ Spójne | Zod `ALLOWED_STATUS_CODES`; DB `Int`; runtime `statusCode ?? 302`. |
| **Wykluczenie linkMapId ↔ destination (CREATE)** | ✅ Spójne | Zod superRefine + `createRule` + testy `redirect-rule.schemas.spec.ts`. |
| **Wykluczenie (UPDATE z oboma polami)** | ✅ Gdy `linkMapId` w body | Patrz P0-3 gdy tylko `destination`. |
| **Link-map rule constraints** | ⚠️ P1 | Zod **nie** wymusza `pathMatch: prefix` + `queryMatch: ignore` przy `linkMapId`. Dopiero `validateLinkMapRule` w serwisie (~1948–1967). Błąd 400 po przejściu Zod — rozjazd warstw. |
| **Destination URL scheme** | ⚠️ P1 | Link map entry wymaga `http(s)://` w Zod (`link-map.schemas.ts` 7–14). Redirect rule **nie** — tylko `RuleValidatorService.validateUrlStructure` (dopuszcza `/relative`). |
| **Regex w źródle vs zwykła ścieżka** | ✅ Uporządkowane | `parseStoredRegexSource` / `isStoredRegexSource` współdzielone; walidator `$N` tylko przy regex source; testy create/update odrzucają `$N` na plain path. |
| **Placeholdery** | ⚠️ P1 | Walidator zna listę `KNOWN_VARIABLES`; runtime akceptuje `query.*`, `segments.*`, `domain.subdomains.*` bez listy. `geo.country` — zakomentowany w silniku, brak w walidatorze (spójne „nie wspierane”). |
| **Manipulatory** | ⚠️ P1 | Walidator: unknown → **błąd zapisu**. Runtime: unknown → **warn + skip** (`applyModifiers` 3423–3424). Stare reguły po usunięciu manipulatora z kodu nadal działają częściowo. |
| **Głębokość zagnieżdżenia 32** | ✅ Spójne | `REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH: 32` (`constants.ts`); walidator `depth > 32`; runtime `processConditionals` `depth > 32` → throw → `processRule` catch → skip reguły. |

---

### ETAP 2 — Ścieżka krytyczna i edge cases

#### Pętle / przepełnienie stosu

- **Nieskończona pętla wewnętrzna:** Silnik zwraca jeden URL na żądanie; brak łańcucha wewnętrznych redirectów. Pętle zewnętrzne (A→B→A) — poza zakresem silnika.
- **Rekursja ternary:** Limit 32 poziomów; test „40 warstw” → `getRedirect` null + log (`redirect.service.spec.ts` ~866–894). Kolejna reguła może przejąć (`~896–913`).
- **Ryzyko stack overflow:** Praktycznie zastąpione limitem głębokości; głębokość 33+ nie dojdzie do pełnego stack overflow dzięki throw.

#### Missing keys w Link Map

**Przepływ end-to-end (udokumentowany i spójny):**

1. Reguła pasuje ścieżkę (`processRule` → match).
2. `getRedirectMatch` wywołuje `resolveLinkMapTarget` (`redirect.service.ts` 2504–2521).
3. `linkMapService.resolveLinkMapDestination` — brak wpisu:
   - `queryMatch: ignore|exact` → `fallbackDestination ?? null` (932–957).
   - `subset` → iteracja; na końcu fallback (960–974).
4. `null` → **`continue`** do następnej reguły (nie wyjątek, nie wildcard).

```2504:2521:backend/src/redirect/redirect.service.ts
        if (rule.linkMapId) {
          const linkMapMatch = await this.resolveLinkMapTarget(...);
          if (linkMapMatch) {
            return { target: linkMapMatch.target, ... };
          }
          continue;
        }
```

**Testy:** mock `resolveLinkMapDestination` → null, druga reguła wygrywa (`redirect.service.spec.ts` ~666–689); integracja `applyRedirect` bez fallback mapy (`~2446+`); link-map unit: brak wpisu + brak fallback → `null` (`link-map.service.spec.ts` ~804–828).

**Niespójność dokumentacyjna (P2):** Fallback jest na poziomie **Link Map**, nie reguły — reguła jest „skipped”, nie „failed”.

#### Normalizacja i kodowanie

| Temat | Zachowanie | Luka |
|--------|------------|------|
| **Query w regułach redirect** | `URL` / `URLSearchParams`; exact/subset/ignore z sortowaniem wartości (`toQueryMap`) | Brak testów emoji / `%` w kluczach query reguł |
| **Klucze link map** | Zod odrzuca `%`, spacje, `#` (`link-map.schemas.ts` 25–27) | Request path z `%20` jest dekodowany przez parser URL; klucz w mapie bez `%` może **nie trafić** |
| **caseSensitive guardrail** | API: zakaz `true → false` (`link-map.service.ts` 220–227); normalizacja przy zapisie i w `resolveLinkMapDestination` | Brak dedykowanego testu E2E case-sensitive match w `link-map.service.spec.ts` (tylko test odrzucenia zmiany) |
| **Cache vs DB** | `buildRawData`/`buildContext` używa `caseSensitive` z mapy; invalidacja przy mutacjach | Spójne przy TTL 300s; negatywny cache 60s dla usuniętej mapy (`getLinkMapContext` 1113–1115) |

**Legacy ignore maps (P2):** Test „legacy keyNormalized still includes query” (`link-map.service.spec.ts` ~777–801) — świadoma tolerancja starych danych; nowe wpisy normalizowane przy zapisie.

---

### ETAP 3 — Test fidelity

#### Mocki vs produkcja

| Komponent | W testach | Produkcja | Ocena |
|-----------|-----------|-------------|--------|
| **Link map** | Mock `resolveLinkMapDestination` w większości testów routingu | Pełna logika + Redis | P1 — integracja map pokryta w `link-map.service.spec.ts`, nie w pełnym łańcuchu redirect |
| **Geo / IP** | Brak `geo.country` (zakomentowane w silniku) | Brak | ✅ Zgodne |
| **Accept-Language** | Stub nagłówka w `createMockRequest` | `parsePrimaryAcceptLanguageTag` — pierwszy tag listy, **nie** q-value ranking | Testy odzwierciedlają implementację; dokumentacja publiczna powinna to podkreślać |
| **Cache redirect context** | `getRedirectContext` mockowany w testach apply | Redis + L1 | Simulate celowo czyta DB (`shared/not-public/cache-and-data-layer.md`) |

#### Regresje granic ścieżek / matematyka

| Przypadek | Pokrycie |
|-----------|----------|
| `/v1` vs `/v11` prefix | ✅ `redirect.service.spec.ts` ~586–597 |
| `/long/` vs `/long` | ✅ ~600–612 |
| `divide_10` (łańcuch, warunki) | ✅ ~847–862, ~1150–1156 |
| `round` skrajne | ✅ ~990–1008 |
| **`multiply_10`** | ❌ Brak dedykowanych asercji (tylko w dokumentacji / UI) |
| **`url_decode`** | ❌ Test nazwany „url_encode and url_decode” testuje tylko encode (~941–943) |
| **`base64_encode`** | ✅ ~945–948 |
| **`datetime()`** | ✅ Rozbudowany blok ~1385–1495 |

#### Mechanizmy bez / ze słabym pokryciem

- `includes` operator w warunkach — używany pośrednio (accept-language), brak izolowanego testu.
- `datetime()` w **placeholderach** destination — nieobsługiwane (tylko w warunkach) — brak testu regresji „nie powinno działać”.
- Błędny `url_decode` na niepoprawnym % — manipulator łapie wyjątek i zwraca poprzednią wartość (~3415–3420) — brak testu.

---

### ETAP 4 — Opsec i infrastruktura

#### Regex performance

Patrz **P0-1**. Dodatkowo: walidator duplikuje `findOperatorPosition` / `splitConditional` z silnikiem — przy zmianie w jednym miejscu drugie może zostać (dry violation).

#### Analityka (`GET .../redirect-rules/analytics`)

- **Autoryzacja:** `ApiOrUserAuthGuard` + `organizationId` z tokena (`redirect-rules.controller.ts` 53–72).
- **SQL:** Wszystkie agregaty filtrują `organizationId` (`fetchTopRuleHits` 1334, `fetchTopLinkMapKeysByRule` 1387).
- **Wyciek między tenantami:** Nie zaobserwowano w ścieżce API — `getTopRulesGlobal` tylko dla schedulera bezpieczeństwa, nie wystawione na controller.

**Ekspozycja danych w obrębie organizacji (P2 — zamierzone, ale wrażliwe):**

- `topRequestVariants` zawiera `requestUrl`, `requestQuery`, `destination`, `linkMapKey` (do 10 na regułę).
- To **dane operacyjne kampanii** (UTM, ścieżki) — nie „tajemnica innej organizacji”, ale pełny wgląd w ruch dla każdego z API key org.

#### `/simulate` (max 100 wpisów)

```215:217:backend/src/zod-schames/redirect-rule.schemas.ts
export const SimulateRedirectsSchema = z.object({
  entries: z.array(SimulationEntrySchema).min(1).max(100),
```

- Weryfikacja przynależności `domainGroupId` do `organizationId` (`simulateRedirects` 2358–2388).
- **Hostname:** Gdy grupa ma domeny — hostname musi być na liście; gdy **brak domen** — dowolny `requestedHost` akceptowany (~2417–2435) — wpływa tylko na zmienne domenowe w symulacji, nie na routing innej org.
- **Nie odczytuje** cache edge — zgodnie z `cache-and-data-layer.md` (świeże reguły z DB).
- Limit 100 — ogranicza enumerację, nie usuwa możliwości masowego testu własnych reguł.

**Wniosek Opsec:** Brak P0 cross-tenant; P2 — simulate/analytics ujawniają pełne URL-e docelowe **własnej** organizacji (oczekiwane dla operatora).

---

## 4. REKOMENDACJE ARCHITEKTONICZNE

### 4.1 Single source of truth dla silnika

1. **Wyodrębnij moduł `redirect-engine/`** (czyste funkcje):
   - parsowanie regex source,
   - `splitConditional` / `findOperatorPosition`,
   - lista manipulatorów + metadata (id, arity, security class),
   - lista zmiennych i funkcji (`time`, `random`, `datetime`).
2. **Generuj z niego:**
   - fragment Zod (enum manipulatorów, enum pathMatch dla link-map rules),
   - walidację zapisu,
   - runtime (import tych samych funkcji).
3. **Test kontraktu:** jeden plik `.spec.ts` porównujący output walidatora i silnika na zestawie 200+ stringów (property-based dla nested ternary).

### 4.2 Bezpieczeństwo regex (P0)

- Wprowadź **RE2** (np. `re2` npm) lub limit czasu na dopasowanie (worker / `vm` z timeout — cięższe).
- Ogranicz długość wzorca (np. 512) i liczbę grup przechwytujących.
- Odrzuć wzorce znane jako niebezpieczne (np. zagnieżdżone kwantyfikatory) przy zapisie.
- Rozważ **wyłączenie flag `g`** na hot path (global regex ze stanem `lastIndex`).

### 4.3 Spójność danych link-map / redirect

- **CHECK DB** (lub trigger): `(link_map_id IS NULL) = (destination IS NOT NULL)` dla aktywnych reguł.
- Przenieś reguły link-map do **dedykowanego Zod discriminated union**:
  - `type: 'static' | 'link_map'`
  - uniemożliwi wysłanie `pathMatch: exact` z `linkMapId` już na poziomie OpenAPI/Zod.
- Ujednolić wymaganie `https?://` dla destination redirect rule lub udokumentować wyjątek dla ścieżek względnych.

### 4.4 Test pyramid

- **Contract tests:** `redirect-rule.schemas` + `RuleValidatorService` + golden files z `shared/docs/pages/concepts/redirect-engine-concepts.md`.
- **Integracja:** 1–2 testy e2e bez mocka `LinkMapService` (Testcontainers / seeded DB).
- Uzupełnić: `multiply_10`, `url_decode` malformed, `%` w kluczach map vs request, case-sensitive match, PATCH destination-only na regule link-map (oczekiwany 409 vs silent null).

### 4.5 Observability

- Metryka: `redirect_rule_skipped_total{reason=link_map_miss|recursion|processing_error}`.
- Alert na reguły z `destination IS NULL AND link_map_id IS NULL AND deleted_at IS NULL` (cron).

---

## 5. MACIERZ SPÓJNOŚCI (SKRÓT)

| Warstwa | Redirect rules | Link maps |
|---------|----------------|-----------|
| Zod | Create/update exclusivity ✅; link-map mode ⚠️ serwis | Keys strict ✅; destination https ✅ |
| Validator | Destination logic ✅; regex compile ⚠️ ReDoS | N/A (destinations scanned) |
| Service | Routing ✅; link-map skip ✅ | Resolve + fallback ✅; cache ✅ |
| DB | Nullable destination ⚠️ | `keyNormalized` unique ✅ |
| Tests | Silnik ✅; map mock ⚠️ | Resolve ✅; case match ⚠️ |

---

## 6. WNIOSKI KOŃCOWE

Architektura LinkShift redirect engine jest **dojrzała funkcjonalnie**: wykluczenie link map przy zapisie (z zastrzeżeniem PATCH P0-3), przewidywalne zachowanie przy braku klucza mapy (skip → następna reguła / fallback mapy), oraz sensowne limity rekursji. Główna bariera dla „10/10 integrity” to **brak jednego modułu źródłowego prawdy** oraz **brak twardej ochrony regex (P0-1)**. Rekomendowany kolejny krok produktowy: P0-1 (ReDoS), potem discriminated union w Zod + DB CHECK, potem konsolidacja parsera warunków.

---

*Audyt wykonany statycznie na stanie repozytorium 2026-05-26. Nie zastępuje testów penetracyjnych ani review infrastruktury Redis/Postgres.*
