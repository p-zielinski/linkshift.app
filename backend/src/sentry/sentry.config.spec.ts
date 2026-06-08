import {
  SENTRY_REDACTED_VALUE,
  createSentryInitOptions,
  isSensitiveFieldName,
  scrubCookieValue,
  scrubSentryEvent,
  scrubSensitiveRecord,
} from './sentry.config';

describe('sentry.config', () => {
  it('disables default PII and wires beforeSend', () => {
    const options = createSentryInitOptions('production', 'https://example.invalid/1');

    expect(options.sendDefaultPii).toBe(false);
    expect(options.environment).toBe('production');
    expect(options.beforeSend).toBe(scrubSentryEvent);
  });

  it('identifies sensitive field names', () => {
    expect(isSensitiveFieldName('password')).toBe(true);
    expect(isSensitiveFieldName('refresh_token')).toBe(true);
    expect(isSensitiveFieldName('email')).toBe(false);
  });

  it('redacts authorization headers and token fields from records', () => {
    const scrubbed = scrubSensitiveRecord({
      Authorization: 'Bearer secret-token',
      'content-type': 'application/json',
      password: 'hunter2',
      nested: {
        access_token: 'abc123',
        safe: 'value',
      },
    });

    expect(scrubbed).toEqual({
      Authorization: SENTRY_REDACTED_VALUE,
      'content-type': 'application/json',
      password: SENTRY_REDACTED_VALUE,
      nested: {
        access_token: SENTRY_REDACTED_VALUE,
        safe: 'value',
      },
    });
  });

  it('redacts refresh_token values inside cookie strings', () => {
    const scrubbed = scrubCookieValue(
      'refresh_token=super-secret; theme=dark; access_token=also-secret',
    );

    expect(scrubbed).toBe(
      `refresh_token=${SENTRY_REDACTED_VALUE}; theme=dark; access_token=${SENTRY_REDACTED_VALUE}`,
    );
  });

  it('scrubs request data from sentry events', () => {
    const event = scrubSentryEvent({
      request: {
        headers: {
          authorization: 'Bearer abc',
          cookie: 'refresh_token=secret; other=1',
        },
        cookies: {
          refresh_token: 'secret',
          theme: 'dark',
        },
        data: {
          email: 'user@example.com',
          password: 'hunter2',
        },
      },
      extra: {
        token: 'should-hide',
        requestId: 'req_123',
      },
    });

    expect(event.request?.headers).toEqual({
      authorization: SENTRY_REDACTED_VALUE,
      cookie: SENTRY_REDACTED_VALUE,
    });
    expect(event.request?.cookies).toEqual({
      refresh_token: SENTRY_REDACTED_VALUE,
      theme: 'dark',
    });
    expect(event.request?.data).toEqual({
      email: 'user@example.com',
      password: SENTRY_REDACTED_VALUE,
    });
    expect(event.extra).toEqual({
      token: SENTRY_REDACTED_VALUE,
      requestId: 'req_123',
    });
  });
});
