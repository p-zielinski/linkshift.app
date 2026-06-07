import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DocsAssistantComponent } from './docs-assistant.component';
import {
  DocsAssistantDrawerService,
} from '../../services/docs-assistant-drawer.service';
import { DocsAssistantSessionService } from '../../services/docs-assistant-session.service';
import { DocumentationScrollService } from '../../services/documentation-scroll.service';
import type { DocsAssistantThread } from '../../services/docs-assistant-history.storage';

describe('DocsAssistantComponent', () => {
  let component: DocsAssistantComponent;
  let drawerClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    drawerClose = vi.fn();
    TestBed.configureTestingModule({
      imports: [DocsAssistantComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: DocumentationScrollService,
          useValue: {
            onMarkdownContentReady: vi.fn(),
            setPendingFragment: vi.fn(),
            scrollToFragment: vi.fn(),
          },
        },
        {
          provide: DocsAssistantSessionService,
          useValue: {
            threads: signal([]),
            activeThread: signal(null),
            isSearching: signal(false),
            searchStage: signal(null),
            searchElapsedSeconds: signal(0),
            searchStatusLabel: signal('Searching docs…'),
            showLongSearchHint: signal(false),
            errorMessage: signal(null),
            submitQuestion: vi.fn().mockResolvedValue(undefined),
            startNewThread: vi.fn(),
            selectThread: vi.fn(),
            deleteThread: vi.fn(),
            clearAllHistory: vi.fn(),
            rateMessage: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DocsAssistantDrawerService,
          useValue: { open: signal(true), closeDrawer: drawerClose },
        },
      ],
    });

    const fixture = TestBed.createComponent(DocsAssistantComponent);
    component = fixture.componentInstance;
  });

  it('onSourceLinkClick closes the drawer for a normal left click', () => {
    const event = new MouseEvent('click', { button: 0, bubbles: true });

    component.onSourceLinkClick(event);

    expect(drawerClose).toHaveBeenCalled();
  });

  it('onSourceLinkClick ignores modified clicks', () => {
    const event = new MouseEvent('click', { button: 0, ctrlKey: true, bubbles: true });

    component.onSourceLinkClick(event);

    expect(drawerClose).not.toHaveBeenCalled();
  });

  it('onAskClick prevents default and stops propagation', () => {
    const event = new MouseEvent('click', { cancelable: true, bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    const stopPropagation = vi.spyOn(event, 'stopPropagation');

    component.onAskClick(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('onHostSubmit prevents default and stops propagation', () => {
    const event = new Event('submit', { cancelable: true, bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    const stopPropagation = vi.spyOn(event, 'stopPropagation');

    component.onHostSubmit(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('onComposerEnter ignores plain Enter', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    const onAskClick = vi.spyOn(component, 'onAskClick');

    component.onComposerEnter(event);

    expect(onAskClick).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('onComposerEnter routes Ctrl/Cmd+Enter to onAskClick', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      cancelable: true,
      bubbles: true,
    });
    const onAskClick = vi.spyOn(component, 'onAskClick');

    component.onComposerEnter(event);

    expect(onAskClick).toHaveBeenCalledWith(event);
  });

});

describe('DocsAssistantComponent message rendering', () => {
  beforeEach(() => {
    const thread: DocsAssistantThread = {
      id: 'thread-1',
      title: 'Redirect rule',
      pageContext: null,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          text: 'Use `source` with:\n\n```json\n{"source": "/old-page"}\n```',
          createdAt: new Date().toISOString(),
          rating: null,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TestBed.configureTestingModule({
      imports: [DocsAssistantComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: DocumentationScrollService,
          useValue: {
            onMarkdownContentReady: vi.fn(),
            setPendingFragment: vi.fn(),
            scrollToFragment: vi.fn(),
          },
        },
        {
          provide: DocsAssistantSessionService,
          useValue: {
            threads: signal([thread]),
            activeThread: signal(thread),
            isSearching: signal(false),
            searchStage: signal(null),
            searchElapsedSeconds: signal(0),
            searchStatusLabel: signal('Searching docs…'),
            showLongSearchHint: signal(false),
            errorMessage: signal(null),
            submitQuestion: vi.fn().mockResolvedValue(undefined),
            startNewThread: vi.fn(),
            selectThread: vi.fn(),
            deleteThread: vi.fn(),
            clearAllHistory: vi.fn(),
            rateMessage: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DocsAssistantDrawerService,
          useValue: { open: signal(true) },
        },
      ],
    });
  });

  it('renders assistant answers as markdown with code blocks', async () => {
    const fixture = TestBed.createComponent(DocsAssistantComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inlineCode = fixture.nativeElement.querySelector(
      '.docs-assistant__markdown :not(pre) > code',
    ) as HTMLElement | null;
    const fencedCode = fixture.nativeElement.querySelector(
      '.docs-assistant__markdown pre code',
    ) as HTMLElement | null;

    expect(inlineCode?.textContent).toContain('source');
    expect(fencedCode?.textContent).toContain('/old-page');
  });
});

describe('DocsAssistantComponent source links', () => {
  beforeEach(() => {
    const thread: DocsAssistantThread = {
      id: 'thread-1',
      title: 'Domain groups',
      pageContext: null,
      messages: [
        {
          id: 'assistant-1',
          role: 'assistant',
          text: 'See the domain groups guide.',
          sources: [
            'Guide: Domain groups (/docs/guides/domain-groups-in-dashboard)',
            'API reference: Domain Groups',
          ],
          createdAt: new Date().toISOString(),
          rating: null,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TestBed.configureTestingModule({
      imports: [DocsAssistantComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: DocumentationScrollService,
          useValue: {
            onMarkdownContentReady: vi.fn(),
            setPendingFragment: vi.fn(),
            scrollToFragment: vi.fn(),
          },
        },
        {
          provide: DocsAssistantSessionService,
          useValue: {
            threads: signal([thread]),
            activeThread: signal(thread),
            isSearching: signal(false),
            searchStage: signal(null),
            searchElapsedSeconds: signal(0),
            searchStatusLabel: signal('Searching docs…'),
            showLongSearchHint: signal(false),
            errorMessage: signal(null),
            submitQuestion: vi.fn().mockResolvedValue(undefined),
            startNewThread: vi.fn(),
            selectThread: vi.fn(),
            deleteThread: vi.fn(),
            clearAllHistory: vi.fn(),
            rateMessage: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DocsAssistantDrawerService,
          useValue: { open: signal(true) },
        },
      ],
    });
  });

  it('renders pre-parsed source links and plain labels', () => {
    const fixture = TestBed.createComponent(DocsAssistantComponent);
    fixture.detectChanges();

    const sourceItems = fixture.nativeElement.querySelectorAll(
      '.docs-assistant__sources li',
    ) as NodeListOf<HTMLElement>;

    expect(sourceItems).toHaveLength(2);
    expect(sourceItems[0]?.querySelector('a')?.textContent?.trim()).toBe('Guide: Domain groups');
    expect(sourceItems[0]?.querySelector('a')?.getAttribute('href')).toBe(
      '/docs/guides/domain-groups-in-dashboard',
    );
    expect(sourceItems[1]?.querySelector('span')?.textContent?.trim()).toBe(
      'API reference: Domain Groups',
    );
    expect(sourceItems[1]?.querySelector('a')).toBeNull();
  });
});
