import { TestBed } from '@angular/core/testing';
import type { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { DashboardDialogQueueService } from './dashboard-dialog-queue.service';

function createDialogRef<T>(): {
  ref: MatDialogRef<T>;
  afterClosed$: Subject<T | undefined>;
} {
  const afterClosed$ = new Subject<T | undefined>();
  const ref = {
    afterClosed: () => afterClosed$.asObservable(),
  } as MatDialogRef<T>;

  return { ref, afterClosed$ };
}

describe('DashboardDialogQueueService', () => {
  let service: DashboardDialogQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardDialogQueueService],
    });
    service = TestBed.inject(DashboardDialogQueueService);
  });

  it('is idle before any dialog opens', () => {
    expect(service.isIdle).toBe(true);
  });

  it('whenIdle emits immediately while idle', () => {
    const next = vi.fn();
    const complete = vi.fn();

    service.whenIdle().subscribe({ next, complete });

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('runWhenIdle runs immediately while idle', () => {
    const fn = vi.fn();

    service.runWhenIdle(fn);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('openBlocking marks the queue busy until the dialog closes', () => {
    const { ref, afterClosed$ } = createDialogRef<void>();
    const openFn = vi.fn().mockReturnValue(ref);

    service.openBlocking(openFn);

    expect(openFn).toHaveBeenCalledTimes(1);
    expect(service.isIdle).toBe(false);

    afterClosed$.next(undefined);

    expect(service.isIdle).toBe(true);
  });

  it('whenIdle waits until the active dialog closes', () => {
    const { ref, afterClosed$ } = createDialogRef<void>();
    service.openBlocking(() => ref);

    const next = vi.fn();
    const complete = vi.fn();
    service.whenIdle().subscribe({ next, complete });

    expect(next).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();

    afterClosed$.next(undefined);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('runWhenIdle defers work until the queue is free', () => {
    const { ref, afterClosed$ } = createDialogRef<void>();
    service.openBlocking(() => ref);

    const fn = vi.fn();
    service.runWhenIdle(fn);

    expect(fn).not.toHaveBeenCalled();

    afterClosed$.next(undefined);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('openBlocking defers until the active dialog closes', () => {
    const first = createDialogRef<void>();
    const second = createDialogRef<void>();
    service.openBlocking(() => first.ref);

    const openSecond = vi.fn().mockReturnValue(second.ref);
    const deferredRef = service.openBlocking(openSecond);

    expect(openSecond).not.toHaveBeenCalled();
    expect(service.isIdle).toBe(false);

    const afterClosedNext = vi.fn();
    deferredRef.afterClosed().subscribe(afterClosedNext);

    first.afterClosed$.next(undefined);

    expect(openSecond).toHaveBeenCalledTimes(1);
    expect(service.isIdle).toBe(false);

    second.afterClosed$.next(undefined);

    expect(afterClosedNext).toHaveBeenCalledTimes(1);
    expect(service.isIdle).toBe(true);
  });

  it('runs only one deferred task per idle window', () => {
    const first = createDialogRef<void>();
    const second = createDialogRef<void>();
    service.openBlocking(() => first.ref);

    const openSecond = vi.fn().mockReturnValue(second.ref);
    const openThird = vi.fn();

    service.runWhenIdle(() => service.openBlocking(openSecond));
    service.runWhenIdle(openThird);

    first.afterClosed$.next(undefined);

    expect(openSecond).toHaveBeenCalledTimes(1);
    expect(openThird).not.toHaveBeenCalled();

    second.afterClosed$.next(undefined);

    expect(openThird).toHaveBeenCalledTimes(1);
  });
});
