import { HttpService } from '@nestjs/axios';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { RedirectTraceService } from './redirect-trace.service';

describe('RedirectTraceService SSRF IPv4 blocking', () => {
  const service = new RedirectTraceService(
    {} as HttpService,
    {} as ClsService,
    {} as Logger,
  );

  const isBlockedIp = (address: string): boolean =>
    (service as unknown as { isBlockedIp: (ip: string) => boolean }).isBlockedIp(address);

  it('blocks only private 172.16/12 range, not whole 172/8', () => {
    expect(isBlockedIp('172.16.0.1')).toBe(true);
    expect(isBlockedIp('172.31.255.255')).toBe(true);

    expect(isBlockedIp('172.15.255.255')).toBe(false);
    expect(isBlockedIp('172.32.0.0')).toBe(false);
    expect(isBlockedIp('172.67.1.1')).toBe(false);
  });
});
