import {
  isStoredRegexSource,
  parseStoredRegexSource,
} from './redirect-source.util';

describe('redirect-source.util', () => {
  describe('parseStoredRegexSource', () => {
    it('returns null for single-segment paths', () => {
      expect(parseStoredRegexSource('/go')).toBeNull();
      expect(parseStoredRegexSource('/short')).toBeNull();
    });

    it('returns null for multi-segment plain paths', () => {
      expect(parseStoredRegexSource('/v2/go')).toBeNull();
      expect(parseStoredRegexSource('/partner/acme')).toBeNull();
    });

    it('returns RegExp for stored regex sources', () => {
      const regex = parseStoredRegexSource('/^\\/blog\\/(.+)$/');
      expect(regex).toBeInstanceOf(RegExp);
      expect('/blog/post'.match(regex!)).toBeTruthy();
    });

    it('returns null when suffix is not valid regex flags', () => {
      expect(parseStoredRegexSource('/v2/go')).toBeNull();
    });
  });

  describe('isStoredRegexSource', () => {
    it('matches parseStoredRegexSource nullability', () => {
      expect(isStoredRegexSource('/go')).toBe(false);
      expect(isStoredRegexSource('/v2/go')).toBe(false);
      expect(isStoredRegexSource('/^\\/x$/')).toBe(true);
    });
  });
});
