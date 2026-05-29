import { formatDocsSearchStreamLine } from './docs-assistant-stream.model';
import { parseDocsSearchStreamBuffer } from './docs-assistant-stream.util';

describe('docs-assistant-stream.util', () => {
  it('formats NDJSON lines', () => {
    expect(formatDocsSearchStreamLine({ type: 'status', stage: 'routing' })).toBe(
      '{"type":"status","stage":"routing"}\n',
    );
  });

  it('parses complete NDJSON lines from a buffer', () => {
    const buffer = [
      formatDocsSearchStreamLine({ type: 'status', stage: 'routing' }),
      formatDocsSearchStreamLine({ type: 'status', stage: 'drafting' }),
      formatDocsSearchStreamLine({
        type: 'result',
        answer: 'Hello',
        sources: ['Guide: Test (/docs/guides/test)'],
        logId: 'abc',
        conversationSummary: 'Discussed test guide.',
      }),
    ].join('');

    const { events, remainder } = parseDocsSearchStreamBuffer(buffer);

    expect(events).toEqual([
      { type: 'status', stage: 'routing' },
      { type: 'status', stage: 'drafting' },
      {
        type: 'result',
        answer: 'Hello',
        sources: ['Guide: Test (/docs/guides/test)'],
        logId: 'abc',
        conversationSummary: 'Discussed test guide.',
      },
    ]);
    expect(remainder).toBe('');
  });

  it('keeps partial lines in the remainder', () => {
    const chunk1 = '{"type":"status","stage":"reading"}';
    const chunk2 = '\n{"type":"status","stage":"drafting"}\n';

    let parsed = parseDocsSearchStreamBuffer(chunk1);
    expect(parsed.events).toEqual([]);
    expect(parsed.remainder).toBe(chunk1);

    parsed = parseDocsSearchStreamBuffer(parsed.remainder + chunk2);
    expect(parsed.events).toEqual([
      { type: 'status', stage: 'reading' },
      { type: 'status', stage: 'drafting' },
    ]);
    expect(parsed.remainder).toBe('');
  });
});
