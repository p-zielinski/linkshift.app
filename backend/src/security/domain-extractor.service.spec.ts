import { DomainExtractorService } from './domain-extractor.service';

describe('DomainExtractorService', () => {
  let service: DomainExtractorService;

  beforeEach(() => {
    service = new DomainExtractorService();
  });

  it('extracts domains from nested conditionals', () => {
    const destination =
      "(geo.country == 'US' ? https://us.example.com/one : (path == '/fr' ? https://fr.example.com/two : https://global.example.com))";

    const result = service.extractDomains(destination).sort();

    expect(result).toEqual([
      'fr.example.com',
      'global.example.com',
      'us.example.com',
    ]);
  });

  it('extracts multiple domains from a single rule', () => {
    const destination =
      "path == '/a' ? https://a.example.com : https://b.example.com/path";

    const result = service.extractDomains(destination).sort();

    expect(result).toEqual(['a.example.com', 'b.example.com']);
  });

  it('handles urls with query strings', () => {
    const destination = 'https://example.com/path?utm=source';

    const result = service.extractDomains(destination);

    expect(result).toEqual(['example.com']);
  });

  it('ignores dynamic host placeholders', () => {
    const destination = 'https://{domain.fqdn}/path';

    const result = service.extractDomains(destination);

    expect(result).toEqual([]);
  });

  it('returns empty when the url is malformed', () => {
    const destination = 'not-a-url';

    const result = service.extractDomains(destination);

    expect(result).toEqual([]);
  });
});
