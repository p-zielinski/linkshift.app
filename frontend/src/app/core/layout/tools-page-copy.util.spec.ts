import { describe, expect, it } from 'vitest';
import { resolveToolsPageCopy } from './tools-page-copy.util';

describe('resolveToolsPageCopy', () => {
  it('uses short campaign-focused subtitle without ops intro', () => {
    const copy = resolveToolsPageCopy('campaign');

    expect(copy.subtitle).toContain('QR codes');
    expect(copy.subtitle).not.toContain('operational');
    expect(copy.introTitle).toBeNull();
    expect(copy.introBody).toBeNull();
    expect(copy.qrCard.title).toBe('QR generator');
    expect(copy.redirectTesterCard.title).toBe('Test a link');
    expect(copy.redirectTesterCard.body).not.toContain('hop-by-hop');
  });

  it('keeps advanced operational copy and intro', () => {
    const copy = resolveToolsPageCopy('advanced');

    expect(copy.subtitle).toContain('Operational utilities');
    expect(copy.introTitle).toBe('Why these tools matter');
    expect(copy.introBody).toContain('rollout');
  });
});
