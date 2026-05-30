import type { Logger } from 'nestjs-pino';
import { DocsAssistantPipelineTrace } from './docs-assistant-pipeline-trace.util';

describe('DocsAssistantPipelineTrace', () => {
  it('logs stage start, stage completion, and pipeline summary with durations', () => {
    const logs: Array<{ message: string; payload: Record<string, unknown> }> = [];
    const logger = {
      log: (message: string, payload?: Record<string, unknown>) => {
        logs.push({ message, payload: payload ?? {} });
      },
    } as unknown as Logger;

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-29T12:00:00.000Z'));

    const trace = new DocsAssistantPipelineTrace(logger, 'req-1');
    trace.startStage('routing');

    jest.advanceTimersByTime(250);

    trace.completeStage('routing', {
      intent: 'DOCUMENTATION_SEARCH',
      suggestedCatalogIdsCount: 2,
    });

    jest.advanceTimersByTime(50);

    trace.completePipeline('completed', {
      sourceCount: 2,
      logId: 'log-1',
    });

    jest.useRealTimers();

    expect(logs[0]).toEqual({
      message: 'Docs assistant stage started',
      payload: { requestId: 'req-1', stage: 'routing' },
    });
    expect(logs[1]).toEqual({
      message: 'Docs assistant stage completed',
      payload: {
        requestId: 'req-1',
        stage: 'routing',
        durationMs: 250,
        intent: 'DOCUMENTATION_SEARCH',
        suggestedCatalogIdsCount: 2,
      },
    });
    expect(logs[2]?.message).toBe('Docs assistant pipeline completed');
    expect(logs[2]?.payload).toMatchObject({
      requestId: 'req-1',
      outcome: 'completed',
      stageDurationMs: { routing: 250 },
      sourceCount: 2,
      logId: 'log-1',
      totalDurationMs: 300,
    });
  });
});
