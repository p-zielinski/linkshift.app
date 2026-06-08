import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DocsAssistantApiService } from '../../../core/api/docs-assistant-api.service';
import { TurnstileService } from '../../../core/security/turnstile.service';
import {
  DOCS_ASSISTANT_SEARCH_INITIAL_LABEL,
  DOCS_ASSISTANT_SEARCH_LONG_WAIT_SECONDS,
  DOCS_ASSISTANT_SEARCH_STAGE_LABELS,
  type DocsAssistantSearchStage,
} from '../../../core/api/docs-assistant-search-stages';
import {
  buildThreadTitle,
  clearDocsAssistantHistory,
  readDocsAssistantHistory,
  writeDocsAssistantHistory,
  type DocsAssistantHistorySnapshot,
  type DocsAssistantMessage,
  type DocsAssistantRating,
  type DocsAssistantThread,
} from './docs-assistant-history.storage';

@Injectable({
  providedIn: 'root',
})
export class DocsAssistantSessionService {
  private readonly api = inject(DocsAssistantApiService);
  private readonly turnstile = inject(TurnstileService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isSearching = signal(false);
  readonly searchStage = signal<DocsAssistantSearchStage | null>(null);
  readonly searchElapsedSeconds = signal(0);
  readonly errorMessage = signal<string | null>(null);
  readonly history = signal<DocsAssistantHistorySnapshot>({
    version: 1,
    activeThreadId: null,
    threads: [],
  });

  readonly activeThread = computed(() => {
    const snapshot = this.history();
    if (!snapshot.activeThreadId) {
      return null;
    }

    return snapshot.threads.find((thread) => thread.id === snapshot.activeThreadId) ?? null;
  });

  readonly threads = computed(() => this.history().threads);

  readonly searchStatusLabel = computed(() => {
    const stage = this.searchStage();
    if (stage) {
      return DOCS_ASSISTANT_SEARCH_STAGE_LABELS[stage];
    }

    return DOCS_ASSISTANT_SEARCH_INITIAL_LABEL;
  });

  readonly showLongSearchHint = computed(
    () => this.isSearching() && this.searchElapsedSeconds() >= DOCS_ASSISTANT_SEARCH_LONG_WAIT_SECONDS,
  );

  private searchElapsedTimer: ReturnType<typeof setInterval> | null = null;
  private searchStartedAtMs: number | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.history.set(readDocsAssistantHistory());
    }
  }

  startNewThread(pageContext: string | null = null): void {
    const thread = this.createThread(pageContext);
    this.patchHistory((snapshot) => ({
      ...snapshot,
      activeThreadId: thread.id,
      threads: [thread, ...snapshot.threads],
    }));
  }

  selectThread(threadId: string): void {
    this.patchHistory((snapshot) => ({
      ...snapshot,
      activeThreadId: threadId,
    }));
  }

  deleteThread(threadId: string): void {
    this.patchHistory((snapshot) => {
      const threads = snapshot.threads.filter((thread) => thread.id !== threadId);
      const activeThreadId =
        snapshot.activeThreadId === threadId ? (threads[0]?.id ?? null) : snapshot.activeThreadId;

      return {
        ...snapshot,
        threads,
        activeThreadId,
      };
    });
  }

  clearAllHistory(): void {
    clearDocsAssistantHistory();
    this.history.set({
      version: 1,
      activeThreadId: null,
      threads: [],
    });
  }

  async submitQuestion(question: string, pageContext: string | null): Promise<void> {
    const trimmed = question.trim();
    if (!trimmed || this.isSearching()) {
      return;
    }

    this.errorMessage.set(null);
    this.isSearching.set(true);
    this.searchStage.set(null);
    this.startSearchElapsedTimer();

    let thread = this.activeThread();
    if (!thread) {
      this.startNewThread(pageContext);
      thread = this.activeThread();
    }

    if (!thread) {
      this.isSearching.set(false);
      return;
    }

    const userMessage = this.createMessage('user', trimmed);
    this.appendMessage(thread.id, userMessage, {
      title: thread.messages.length === 0 ? buildThreadTitle(trimmed) : thread.title,
      pageContext: thread.pageContext ?? pageContext,
    });

    try {
      const turnstileToken = await this.turnstile.requestToken();
      const priorSummary = thread.conversationSummary?.trim() || null;
      const result = await this.api.searchStream(trimmed, priorSummary, turnstileToken, (stage) => {
        this.searchStage.set(stage);
      });
      this.turnstile.reset();

      const assistantMessage = this.createMessage('assistant', result.answer, {
        sources: result.sources,
        logId: result.logId,
      });
      this.appendMessage(thread.id, assistantMessage, {
        conversationSummary: result.conversationSummary,
      });
    } catch (error) {
      this.turnstile.reset();
      this.errorMessage.set(await this.resolveErrorMessage(error));
    } finally {
      this.stopSearchElapsedTimer();
      this.isSearching.set(false);
      this.searchStage.set(null);
    }
  }

  async rateMessage(logId: string, rating: DocsAssistantRating): Promise<void> {
    const thread = this.activeThread();
    if (!thread) {
      return;
    }

    this.patchHistory((snapshot) => ({
      ...snapshot,
      threads: snapshot.threads.map((entry) => {
        if (entry.id !== thread.id) {
          return entry;
        }

        return {
          ...entry,
          messages: entry.messages.map((message) =>
            message.logId === logId ? { ...message, rating } : message,
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    try {
      await firstValueFrom(this.api.rateAnswer(logId, rating));
    } catch {
      // Rating is best-effort; keep local state.
    }
  }

  private patchHistory(
    updater: (snapshot: DocsAssistantHistorySnapshot) => DocsAssistantHistorySnapshot,
  ): void {
    const next = updater(this.history());
    this.history.set(next);
    writeDocsAssistantHistory(next);
  }

  private appendMessage(
    threadId: string,
    message: DocsAssistantMessage,
    options?: {
      title?: string;
      pageContext?: string | null;
      conversationSummary?: string | null;
    },
  ): void {
    const now = new Date().toISOString();
    this.patchHistory((snapshot) => ({
      ...snapshot,
      activeThreadId: threadId,
      threads: snapshot.threads.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }

        const conversationSummary =
          options && 'conversationSummary' in options
            ? (options.conversationSummary ?? null)
            : thread.conversationSummary;

        return {
          ...thread,
          title: options?.title ?? thread.title,
          pageContext: options?.pageContext ?? thread.pageContext,
          conversationSummary,
          messages: [...thread.messages, message],
          updatedAt: now,
        };
      }),
    }));
  }

  private createThread(pageContext: string | null): DocsAssistantThread {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      title: 'New chat',
      pageContext,
      conversationSummary: null,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  private createMessage(
    role: DocsAssistantMessage['role'],
    text: string,
    extras?: Pick<DocsAssistantMessage, 'sources' | 'logId'>,
  ): DocsAssistantMessage {
    return {
      id: crypto.randomUUID(),
      role,
      text,
      sources: extras?.sources,
      logId: extras?.logId,
      rating: null,
      createdAt: new Date().toISOString(),
    };
  }

  private async resolveErrorMessage(error: unknown): Promise<string> {
    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    if (!(error instanceof HttpErrorResponse)) {
      return "Couldn't get an answer. Try again in a moment";
    }

    const details = await this.extractDetails(error.error);
    if (details) {
      return details;
    }

    if (error.status === 429) {
      return 'Too many questions. Wait a minute and try again';
    }

    if (error.status === 403) {
      return "Couldn't verify the request. Refresh the page and try again";
    }

    return "Couldn't get an answer. Try again in a moment";
  }

  private async extractDetails(payload: unknown): Promise<string | null> {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      return payload.trim() || null;
    }

    if (typeof payload === 'object' && payload !== null && 'details' in payload) {
      const details = (payload as { details?: unknown }).details;
      return typeof details === 'string' && details.trim() ? details.trim() : null;
    }

    return null;
  }

  private startSearchElapsedTimer(): void {
    this.stopSearchElapsedTimer();
    this.searchStartedAtMs = Date.now();
    this.searchElapsedSeconds.set(0);
    this.searchElapsedTimer = setInterval(() => {
      if (this.searchStartedAtMs === null) {
        return;
      }

      this.searchElapsedSeconds.set(Math.floor((Date.now() - this.searchStartedAtMs) / 1000));
    }, 1000);
  }

  private stopSearchElapsedTimer(): void {
    if (this.searchElapsedTimer) {
      clearInterval(this.searchElapsedTimer);
      this.searchElapsedTimer = null;
    }

    this.searchStartedAtMs = null;
    this.searchElapsedSeconds.set(0);
  }
}
