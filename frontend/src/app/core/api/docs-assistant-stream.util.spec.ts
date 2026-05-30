import { parseDocsAssistantStreamBuffer } from './docs-assistant-stream.util';

describe('docs-assistant-stream.util', () => {
  it('parses status and result events from chunked NDJSON', () => {
    const chunk1 = '{"type":"status","stage":"routing"}\n{"type":"status","stage":"draft';
    const chunk2 =
      'ing"}\n{"type":"result","answer":"Done","sources":[],"logId":null,"conversationSummary":null}\n';

    let parsed = parseDocsAssistantStreamBuffer(chunk1);
    expect(parsed.events).toEqual([{ type: 'status', stage: 'routing' }]);
    expect(parsed.remainder).toBe('{"type":"status","stage":"draft');

    parsed = parseDocsAssistantStreamBuffer(parsed.remainder + chunk2);
    expect(parsed.events).toEqual([
      { type: 'status', stage: 'drafting' },
      { type: 'result', answer: 'Done', sources: [], logId: null, conversationSummary: null },
    ]);
  });

  it('rejects result events without conversationSummary', () => {
    const parsed = parseDocsAssistantStreamBuffer(
      '{"type":"result","answer":"Hello","sources":["Guide"],"logId":"abc"}\n',
    );

    expect(parsed.events).toEqual([]);
  });

  it('parses stream error events', () => {
    const parsed = parseDocsAssistantStreamBuffer(
      '{"type":"error","details":"Couldn\'t get an answer. Try again in a moment"}\n',
    );

    expect(parsed.events).toEqual([
      { type: 'error', details: "Couldn't get an answer. Try again in a moment" },
    ]);
  });
});
