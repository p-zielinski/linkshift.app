import type { Domain } from '../../../../core/models/domain.model';
import { canVerifyDomainDns, domainDnsStatusView } from './domains-table.util';

describe('domains-table.util', () => {
  const domain = (dnsStatus: Domain['dnsStatus']): Pick<Domain, 'dnsStatus'> => ({ dnsStatus });

  it('maps DNS status labels and pill classes', () => {
    expect(domainDnsStatusView('PENDING').label).toBe('Pending');
    expect(domainDnsStatusView('PENDING').className).toContain('status-pill--pending');
    expect(domainDnsStatusView('VERIFIED').label).toBe('Verified');
    expect(domainDnsStatusView('VERIFIED').className).toContain('status-pill--success');
    expect(domainDnsStatusView('FAILED').label).toBe('Failed');
    expect(domainDnsStatusView('FAILED').className).toContain('status-pill--danger');
  });

  it('allows verify for pending and failed domains only', () => {
    expect(canVerifyDomainDns(domain('PENDING'))).toBe(true);
    expect(canVerifyDomainDns(domain('FAILED'))).toBe(true);
    expect(canVerifyDomainDns(domain('VERIFIED'))).toBe(false);
  });
});
