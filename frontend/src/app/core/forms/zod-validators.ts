import { validate } from '@angular/forms/signals';
import type { ZodTypeAny } from 'zod';

export function applyZodField(field: any, schema: ZodTypeAny): void {
  validate(field, ({ value }) => {
    const result = schema.safeParse(value());
    if (result.success) {
      return undefined;
    }

    const issue = result.error.issues[0];
    return {
      kind: 'zod',
      message: issue?.message ?? 'Invalid value'
    };
  });
}
