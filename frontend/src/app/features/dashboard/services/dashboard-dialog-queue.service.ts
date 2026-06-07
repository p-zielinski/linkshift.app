import { Injectable } from '@angular/core';
import type { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, of } from 'rxjs';

/**
 * Serializes blocking dashboard modals (onboarding, create-link, connect-domain)
 * so they do not stack on the same navigation mount.
 */
@Injectable({ providedIn: 'root' })
export class DashboardDialogQueueService {
  private activeCount = 0;
  private readonly taskQueue: Array<() => void> = [];

  get isIdle(): boolean {
    return this.activeCount === 0;
  }

  whenIdle(): Observable<void> {
    if (this.isIdle) {
      return of(undefined);
    }

    return new Observable<void>((subscriber) => {
      this.enqueue(() => {
        subscriber.next();
        subscriber.complete();
      });
    });
  }

  runWhenIdle(fn: () => void): void {
    this.enqueue(fn);
  }

  openBlocking<T>(openFn: () => MatDialogRef<T>): MatDialogRef<T> {
    if (this.isIdle) {
      return this.openBlockingImmediate(openFn);
    }

    const deferred = this.createDeferredDialogRef<T>();
    this.runWhenIdle(() => {
      deferred.bind(this.openBlockingImmediate(openFn));
    });
    return deferred.ref;
  }

  private openBlockingImmediate<T>(openFn: () => MatDialogRef<T>): MatDialogRef<T> {
    this.activeCount += 1;
    const dialogRef = openFn();

    dialogRef.afterClosed().subscribe(() => {
      this.activeCount = Math.max(0, this.activeCount - 1);
      this.pump();
    });

    return dialogRef;
  }

  private createDeferredDialogRef<T>(): {
    ref: MatDialogRef<T>;
    bind: (realRef: MatDialogRef<T>) => void;
  } {
    const afterClosed$ = new Subject<T | undefined>();
    let realRef: MatDialogRef<T> | null = null;

    const ref = {
      afterClosed: () => {
        if (realRef) {
          return realRef.afterClosed();
        }
        return afterClosed$.asObservable();
      },
      get componentRef() {
        return realRef?.componentRef;
      },
    } as MatDialogRef<T>;

    const bind = (resolved: MatDialogRef<T>) => {
      realRef = resolved;
      resolved.afterClosed().subscribe({
        next: (value) => afterClosed$.next(value),
        complete: () => afterClosed$.complete(),
      });
    };

    return { ref, bind };
  }

  private enqueue(task: () => void): void {
    this.taskQueue.push(task);
    this.pump();
  }

  private pump(): void {
    while (this.isIdle && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) {
        return;
      }

      task();

      if (!this.isIdle) {
        return;
      }
    }
  }
}
