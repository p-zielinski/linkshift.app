import { DestroyRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { registerStoreRefreshOnVisibility } from './store-visibility-refresh.util';

function createDestroyRef(): DestroyRef & { destroy(): void } {
  const callbacks: Array<() => void> = [];
  let destroyed = false;
  return {
    get destroyed() {
      return destroyed;
    },
    onDestroy: (callback: () => void) => {
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index >= 0) {
          callbacks.splice(index, 1);
        }
      };
    },
    destroy: () => {
      destroyed = true;
      for (const callback of callbacks) {
        callback();
      }
    },
  };
}

function register(callback: () => void, platformId: string): DestroyRef & { destroy(): void } {
  TestBed.configureTestingModule({
    providers: [{ provide: PLATFORM_ID, useValue: platformId }],
  });

  const destroyRef = createDestroyRef();
  TestBed.runInInjectionContext(() => {
    registerStoreRefreshOnVisibility(destroyRef, callback);
  });
  return destroyRef;
}

describe('registerStoreRefreshOnVisibility', () => {
  it('does not register a listener on the server platform', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    register(vi.fn(), 'server');
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });

  it('calls the callback when the tab becomes visible', () => {
    const callback = vi.fn();
    register(callback, 'browser');

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(callback).toHaveBeenCalledOnce();
  });

  it('does not call the callback when the tab is hidden', () => {
    const callback = vi.fn();
    register(callback, 'browser');

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('removes the listener when destroyed', () => {
    const callback = vi.fn();
    const destroyRef = register(callback, 'browser');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    destroyRef.destroy();

    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    removeSpy.mockRestore();
  });
});
