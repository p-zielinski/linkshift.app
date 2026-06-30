export type TurnstileRequestHeaders = Record<string, string>;

export function withTurnstileToken(
  turnstileToken: string | null | undefined,
  headers: TurnstileRequestHeaders = {},
): TurnstileRequestHeaders {
  const token = turnstileToken?.trim();
  if (!token) {
    return headers;
  }
  return { ...headers, 'X-Turnstile-Token': token };
}
