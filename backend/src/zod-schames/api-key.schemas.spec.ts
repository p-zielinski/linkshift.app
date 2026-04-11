import { CreateApiKeySchema, UpdateApiKeySchema } from './api-key.schemas';

describe('api-key.schemas', () => {
  it('accepts null expiresAt on create', () => {
    const parsed = CreateApiKeySchema.parse({
      name: 'My key',
      expiresAt: null,
    });

    expect(parsed.expiresAt).toBeNull();
  });

  it('accepts null expiresAt on update', () => {
    const parsed = UpdateApiKeySchema.parse({
      expiresAt: null,
    });

    expect(parsed.expiresAt).toBeNull();
  });

  it('rejects past expiresAt date', () => {
    expect(() =>
      CreateApiKeySchema.parse({
        name: 'My key',
        expiresAt: '2020-01-01T00:00:00.000Z',
      }),
    ).toThrow('Expiration date must be in the future');
  });
});
