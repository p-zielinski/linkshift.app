import { DestinationExtractorService } from './destination-extractor.service';
import { Logger } from 'nestjs-pino';

describe('DestinationExtractorService', () => {
  let service: DestinationExtractorService;

  beforeEach(() => {
    service = new DestinationExtractorService({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
    } as unknown as Logger);
  });

  it('extracts domains from nested conditionals', () => {
    const destination =
      "(path == '/us' ? https://us.example.com/one : (path == '/fr' ? https://fr.example.com/two : https://global.example.com))";

    const result = service.extractUrls(destination).sort();

    expect(result).toEqual([
      'fr.example.com/two',
      'global.example.com/',
      'us.example.com/one',
    ]);
  });

  it('extracts multiple domains from a single rule', () => {
    const destination =
      "path == '/a' ? https://a.example.com : https://b.example.com/path";

    const result = service.extractUrls(destination).sort();

    expect(result).toEqual(['a.example.com/', 'b.example.com/path']);
  });

  it('handles urls with query strings', () => {
    const destination = 'https://example.com/path?utm=source';

    const result = service.extractUrls(destination);

    expect(result).toEqual(['example.com/path']);
  });

  it('handles url placeholders in path and query', () => {
    const destination = 'https://example.com/{segments.1}/path?ref={query.1}';

    const result = service.extractUrls(destination);

    expect(result).toEqual(['example.com/slug/path']);
  });

  it('handles placeholders with modifiers and functions in path/query', () => {
    const destination =
      'https://example.com/{domain.root:to_upper_case}/x?ts={time():to_iso_string}&r={random(1,2)}';

    const result = service.extractUrls(destination);

    expect(result).toEqual(['example.com/slug/x']);
  });

  it('ignores placeholders inside host with modifiers', () => {
    const destination = 'https://{domain.root:to_lower_case}.example.com/path';

    const result = service.extractUrls(destination);

    expect(result).toEqual([]);
  });

  it('extracts urls when condition uses regex with question marks', () => {
    const destination =
      'path ~= /foo?bar/ ? https://a.example.com/$1 : https://b.example.com';

    const result = service.extractUrls(destination).sort();

    expect(result).toEqual(['a.example.com/1', 'b.example.com/']);
  });

  it('ignores dynamic host placeholders', () => {
    const destination = 'https://{domain.fqdn}/path';

    const result = service.extractUrls(destination);

    expect(result).toEqual([]);
  });

  it('returns empty when the url is malformed', () => {
    const destination = 'not-a-url';

    const result = service.extractUrls(destination);

    expect(result).toEqual([]);
  });
});
