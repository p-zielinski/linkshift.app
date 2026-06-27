import { SubdomainBlacklistService } from './subdomain-blacklist.service';

describe('SubdomainBlacklistService', () => {
  let service: SubdomainBlacklistService;

  beforeEach(() => {
    service = new SubdomainBlacklistService();
  });

  describe('isValidName', () => {
    it('accepts valid subdomain labels', () => {
      expect(service.isValidName('demo')).toBe(true);
      expect(service.isValidName('my-shop-2')).toBe(true);
    });

    it('rejects invalid subdomain labels', () => {
      expect(service.isValidName('')).toBe(false);
      expect(service.isValidName('bad_name')).toBe(false);
      expect(service.isValidName('has space')).toBe(false);
      expect(service.isValidName('a'.repeat(31))).toBe(false);
    });
  });

  describe('isReserved', () => {
    it('flags reserved infrastructure names', () => {
      expect(service.isReserved('api')).toBe(true);
      expect(service.isReserved('WWW')).toBe(true);
    });

    it('allows non-reserved names', () => {
      expect(service.isReserved('demo')).toBe(false);
    });
  });

  describe('canExistInRegistry', () => {
    it('allows valid, non-reserved names', () => {
      expect(service.canExistInRegistry('demo')).toBe(true);
    });

    it('rejects reserved names even when format is valid', () => {
      expect(service.canExistInRegistry('admin')).toBe(false);
      expect(service.canExistInRegistry('tools')).toBe(false);
    });

    it('rejects invalid format without needing registry lookup', () => {
      expect(service.canExistInRegistry('bad_name')).toBe(false);
      expect(service.canExistInRegistry('a'.repeat(31))).toBe(false);
    });
  });
});
