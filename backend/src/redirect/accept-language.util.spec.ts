import { parsePrimaryAcceptLanguageTag } from './accept-language.util';

describe('parsePrimaryAcceptLanguageTag', () => {
  it('returns the first language tag before q-values', () => {
    expect(parsePrimaryAcceptLanguageTag('pl-PL,pl;q=0.9,en;q=0.8')).toBe(
      'pl-PL',
    );
  });

  it('strips q-value from a single range', () => {
    expect(parsePrimaryAcceptLanguageTag('en;q=0.9')).toBe('en');
  });

  it('trims whitespace around the first range', () => {
    expect(parsePrimaryAcceptLanguageTag('  pl-PL , en;q=0.8')).toBe('pl-PL');
  });

  it('returns empty string for missing or blank input', () => {
    expect(parsePrimaryAcceptLanguageTag(undefined)).toBe('');
    expect(parsePrimaryAcceptLanguageTag('')).toBe('');
    expect(parsePrimaryAcceptLanguageTag('   ')).toBe('');
  });

  it('preserves wildcard and region subtags', () => {
    expect(parsePrimaryAcceptLanguageTag('*')).toBe('*');
    expect(parsePrimaryAcceptLanguageTag('zh-Hans-CN,zh;q=0.9')).toBe(
      'zh-Hans-CN',
    );
  });
});
