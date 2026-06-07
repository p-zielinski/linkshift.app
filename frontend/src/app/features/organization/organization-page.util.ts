import type { OrganizationMember } from '../../core/models/organization-member.model';

export type OrganizationMemberRowViewModel = {
  member: OrganizationMember;
  statusLabel: string;
  statusClass: string;
};

export function memberStatusLabel(member: Pick<OrganizationMember, 'isBlocked'>): string {
  return member.isBlocked ? 'Blocked' : 'Active';
}

export function memberStatusClass(member: Pick<OrganizationMember, 'isBlocked'>): string {
  return member.isBlocked
    ? 'status-pill status-pill--danger'
    : 'status-pill status-pill--success';
}

export function buildOrganizationMemberRowViews(
  members: OrganizationMember[],
): OrganizationMemberRowViewModel[] {
  return members.map((member) => ({
    member,
    statusLabel: memberStatusLabel(member),
    statusClass: memberStatusClass(member),
  }));
}
