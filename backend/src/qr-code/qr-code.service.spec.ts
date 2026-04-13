import { QrCodeService } from './qr-code.service';

describe('QrCodeService', () => {
  const service = new QrCodeService();
  const url = 'https://linkshift.app';

  it('generates SVG payload', async () => {
    const result = await service.generate(url, 'svg', 512);
    expect(result.extension).toBe('svg');
    expect(result.contentType).toContain('image/svg+xml');
    expect(typeof result.payload).toBe('string');
    expect(String(result.payload)).toContain('<svg');
  });

  it('generates PNG payload', async () => {
    const result = await service.generate(url, 'png', 512);
    expect(result.extension).toBe('png');
    expect(result.contentType).toBe('image/png');
    expect(Buffer.isBuffer(result.payload)).toBe(true);
  });

  it('generates EPS payload', async () => {
    const result = await service.generate(url, 'eps', 512);
    expect(result.extension).toBe('eps');
    expect(result.contentType).toContain('application/postscript');
    expect(typeof result.payload).toBe('string');
    expect(String(result.payload)).toContain('%!PS-Adobe');
  });
});
