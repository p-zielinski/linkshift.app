import type { Domain, DomainDnsStatus } from '../../../../core/models/domain.model';

export type DomainDnsStatusView = {
  label: string;
  className: string;
  tooltip: string;
};

const DNS_STATUS_TOOLTIP =
  'Custom domains must have an A record pointing to the LinkShift target IP before redirects work.';

export function domainDnsStatusView(status: DomainDnsStatus): DomainDnsStatusView {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Verified',
        className: 'status-pill status-pill--success',
        tooltip: DNS_STATUS_TOOLTIP,
      };
    case 'FAILED':
      return {
        label: 'Failed',
        className: 'status-pill status-pill--danger',
        tooltip: DNS_STATUS_TOOLTIP,
      };
    case 'PENDING':
    default:
      return {
        label: 'Pending',
        className: 'status-pill status-pill--pending',
        tooltip: DNS_STATUS_TOOLTIP,
      };
  }
}

export function canVerifyDomainDns(domain: Pick<Domain, 'dnsStatus'>): boolean {
  return domain.dnsStatus === 'PENDING' || domain.dnsStatus === 'FAILED';
}
