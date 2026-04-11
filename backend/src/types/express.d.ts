import 'express';
import type { AuthenticatedPrincipal } from '../auth/auth-context.model';

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      user?: AuthenticatedPrincipal;
    }
  }
}

export {};
