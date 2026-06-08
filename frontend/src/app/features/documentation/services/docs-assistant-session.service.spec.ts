import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DocsAssistantApiService } from '../../../core/api/docs-assistant-api.service';
import { TurnstileService } from '../../../core/security/turnstile.service';
import { clearDocsAssistantHistory } from './docs-assistant-history.storage';
import { DocsAssistantSessionService } from './docs-assistant-session.service';

describe('DocsAssistantSessionService', () => {
  let service: DocsAssistantSessionService;
  let searchStream: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    clearDocsAssistantHistory();
    searchStream = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        DocsAssistantSessionService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: DocsAssistantApiService,
          useValue: { searchStream, rateAnswer: vi.fn() },
        },
        {
          provide: TurnstileService,
          useValue: {
            requestToken: vi.fn().mockResolvedValue('token'),
            reset: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(DocsAssistantSessionService);
  });

  afterEach(() => {
    localStorage.clear();
    clearDocsAssistantHistory();
  });

  it('submitQuestion calls searchStream with turnstile token', async () => {
    searchStream.mockResolvedValue({
      answer: 'Use redirect rules.',
      sources: [],
      logId: 'log-1',
      conversationSummary: null,
    });

    await service.submitQuestion('How do redirects work?', null);

    expect(searchStream).toHaveBeenCalledWith(
      'How do redirects work?',
      null,
      'token',
      expect.any(Function),
    );
    expect(service.errorMessage()).toBeNull();
  });

  it('surfaces API errors from searchStream', async () => {
    searchStream.mockRejectedValue(new Error("Couldn't get an answer. Try again in a moment"));

    await service.submitQuestion('How do redirects work?', null);

    expect(service.errorMessage()).toBe("Couldn't get an answer. Try again in a moment");
    expect(service.isSearching()).toBe(false);
  });
});
