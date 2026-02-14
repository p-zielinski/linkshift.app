import { HttpErrorResponse } from '@angular/common/http';

const normalizeMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
    return items.length > 0 ? items.join(', ') : null;
  }
  return null;
};

export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof HttpErrorResponse) {
    return (
      normalizeMessage(error.error?.details) ||
      normalizeMessage(error.error?.message) ||
      normalizeMessage(error.message) ||
      fallback
    );
  }

  if (error && typeof error === 'object') {
    const anyError = error as { details?: unknown; message?: unknown };
    return (
      normalizeMessage(anyError.details) ||
      normalizeMessage(anyError.message) ||
      fallback
    );
  }

  return fallback;
};
