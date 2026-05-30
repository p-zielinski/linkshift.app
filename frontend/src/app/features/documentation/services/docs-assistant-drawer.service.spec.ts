import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  DOCS_ASSISTANT_DRAWER_CLOSE_MS,
  DocsAssistantDrawerService,
} from './docs-assistant-drawer.service';

@Component({ standalone: true, template: '' })
class StubPageComponent {}

describe('DocsAssistantDrawerService', () => {
  let service: DocsAssistantDrawerService;
  let router: Router;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        DocsAssistantDrawerService,
        provideRouter([
          { path: 'docs/a', component: StubPageComponent },
          { path: 'docs/b', component: StubPageComponent },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(DocsAssistantDrawerService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('closes the drawer when navigation changes the route path', async () => {
    await router.navigateByUrl('/docs/a');
    service.openDrawer();

    await router.navigateByUrl('/docs/b');

    expect(service.open()).toBe(false);
    expect(service.contentMounted()).toBe(true);
  });

  it('unmounts content after the close animation duration', () => {
    service.openDrawer();
    service.closeDrawer();

    expect(service.open()).toBe(false);
    expect(service.contentMounted()).toBe(true);

    vi.advanceTimersByTime(DOCS_ASSISTANT_DRAWER_CLOSE_MS);

    expect(service.contentMounted()).toBe(false);
  });

  it('unmounts content when the drawer close animation event fires', () => {
    service.openDrawer();
    service.closeDrawer();

    service.onDrawerAnimationClosed();

    expect(service.contentMounted()).toBe(false);
  });

  it('keeps the drawer open when navigation only changes the fragment', async () => {
    await router.navigateByUrl('/docs/a');
    service.openDrawer();

    await router.navigateByUrl('/docs/a#section');

    expect(service.open()).toBe(true);
    expect(service.contentMounted()).toBe(true);
  });

  it('closes the drawer when leaving docs', async () => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        DocsAssistantDrawerService,
        provideRouter([
          { path: 'docs', component: StubPageComponent },
          { path: 'home', component: StubPageComponent },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(DocsAssistantDrawerService);

    await router.navigateByUrl('/docs');
    service.openDrawer();

    await router.navigateByUrl('/home');

    expect(service.open()).toBe(false);
  });

  it('forceClose clears open and contentMounted immediately', () => {
    service.openDrawer();
    service.forceClose();

    expect(service.open()).toBe(false);
    expect(service.contentMounted()).toBe(false);
  });
});
