import { EmailService } from './email.service';
import { Logger } from 'nestjs-pino';

describe('EmailService', () => {
  const createService = () =>
    new EmailService(
      { get: () => '' } as any,
      {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        setContext: jest.fn(),
      } as unknown as Logger,
    );

  it('parses sender with name and address', () => {
    const service = createService();
    const result = (service as any).parseSender(
      'Redirect App <notify@example.com>',
    );

    expect(result).toEqual({
      address: 'notify@example.com',
      name: 'Redirect App',
    });
  });

  it('parses sender with address only', () => {
    const service = createService();
    const result = (service as any).parseSender('notify@example.com');

    expect(result).toEqual({ address: 'notify@example.com' });
  });

  it('returns null for empty sender', () => {
    const service = createService();
    const result = (service as any).parseSender('');

    expect(result).toBeNull();
  });
});
