import {
  EmailChangeRequestSchema,
  LoginSchema,
  RegisterSchema,
  ResendVerificationSchema,
} from './auth.schemas';

const buildEmail = (localLength: number, domainLabelLengths: number[]) => {
  const localPart = 'a'.repeat(localLength);
  const domain = domainLabelLengths
    .map((labelLength, index) => String.fromCharCode(98 + index).repeat(labelLength))
    .join('.');
  return `${localPart}@${domain}`;
};

describe('auth.schemas', () => {
  const maxLengthEmail = buildEmail(64, [63, 63, 61]);
  const tooLongEmail = buildEmail(64, [63, 63, 61, 1]);

  it('accepts register payload with max organization and email lengths', () => {
    const parsed = RegisterSchema.parse({
      email: maxLengthEmail,
      password: 'strong-password',
      organizationName: 'o'.repeat(50),
      acceptTerms: true,
      acceptPrivacy: true,
      confirmAge: true,
    });

    expect(parsed.email).toHaveLength(254);
    expect(parsed.organizationName).toHaveLength(50);
  });

  it('accepts register payload without organization name', () => {
    const parsed = RegisterSchema.parse({
      email: 'owner@example.com',
      password: 'strong-password',
      acceptTerms: true,
      acceptPrivacy: true,
      confirmAge: true,
    });

    expect(parsed.organizationName).toBeUndefined();
  });

  it('treats blank organization name as missing value', () => {
    const parsed = RegisterSchema.parse({
      email: 'owner@example.com',
      password: 'strong-password',
      organizationName: '   ',
      acceptTerms: true,
      acceptPrivacy: true,
      confirmAge: true,
    });

    expect(parsed.organizationName).toBeUndefined();
  });

  it('rejects organization names longer than 50 characters', () => {
    expect(() =>
      RegisterSchema.parse({
        email: 'owner@example.com',
        password: 'strong-password',
        organizationName: 'o'.repeat(51),
        acceptTerms: true,
        acceptPrivacy: true,
        confirmAge: true,
      }),
    ).toThrow('Organization name must be at most 50 characters');
  });

  it('rejects email longer than 254 chars on login', () => {
    expect(() =>
      LoginSchema.parse({
        email: tooLongEmail,
        password: 'password123',
      }),
    ).toThrow('Email must be at most 254 characters');
  });

  it('rejects email longer than 254 chars on optional resend-verification email', () => {
    expect(() =>
      ResendVerificationSchema.parse({
        email: tooLongEmail,
      }),
    ).toThrow('Email must be at most 254 characters');
  });

  it('rejects email longer than 254 chars on email change', () => {
    expect(() =>
      EmailChangeRequestSchema.parse({
        newEmail: tooLongEmail,
      }),
    ).toThrow('Email must be at most 254 characters');
  });
});
