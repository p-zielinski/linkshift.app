import { resolveLinksEditDialogTarget } from './links-edit-dialog.util';

describe('resolveLinksEditDialogTarget', () => {
  it('returns campaign-simplified in campaign mode', () => {
    expect(resolveLinksEditDialogTarget(true)).toBe('campaign-simplified');
  });

  it('returns advanced-entry-form outside campaign mode', () => {
    expect(resolveLinksEditDialogTarget(false)).toBe('advanced-entry-form');
  });
});
