export type DomainDnsStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export type Domain = {
  id: string;
  name: string;
  domainGroupId: string;
  dnsStatus: DomainDnsStatus;
  dnsVerifiedAt?: string | null;
  dnsLastCheckedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateDomainDto = {
  name: string;
  domainGroupId: string;
};

export type UpdateDomainDto = {
  domainGroupId: string;
};
