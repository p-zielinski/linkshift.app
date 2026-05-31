/** Auth routes that must stay reachable before legal consent is up to date. */
export const AUTH_PATHS_BYPASSING_LEGAL_CONSENT = [
  '/api/v1/auth/accept-legal',
  '/api/v1/auth/session',
] as const;

export function shouldBypassLegalConsentCheck(request: {
  path?: string;
  url?: string;
}): boolean {
  const path = request.path ?? request.url ?? '';
  return AUTH_PATHS_BYPASSING_LEGAL_CONSENT.some((prefix) => path.startsWith(prefix));
}
