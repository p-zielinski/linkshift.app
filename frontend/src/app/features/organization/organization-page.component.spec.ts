import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { OrganizationMember } from '../../core/models/organization-member.model';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationMembersApiService } from '../../core/api/organization-members-api.service';
import { OrganizationMembersStore } from '../../core/store/organization-members.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { SetupChecklistService } from '../../shared/components/setup-checklist/setup-checklist.service';
import { OrganizationPageComponent } from './organization-page.component';
import {
  buildOrganizationMemberRowViews,
  memberStatusClass,
  memberStatusLabel,
} from './organization-page.util';

describe('organization-page member status view models', () => {
  const activeMember: OrganizationMember = {
    id: 'user-active',
    email: 'active@example.com',
    isOwner: false,
    isBlocked: false,
    emailVerifiedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  const blockedMember: OrganizationMember = {
    ...activeMember,
    id: 'user-blocked',
    email: 'blocked@example.com',
    isBlocked: true,
    emailVerifiedAt: null,
  };

  it('maps active member status label and class', () => {
    expect(memberStatusLabel(activeMember)).toBe('Active');
    expect(memberStatusClass(activeMember)).toBe('status-pill status-pill--success');
  });

  it('maps blocked member status label and class', () => {
    expect(memberStatusLabel(blockedMember)).toBe('Blocked');
    expect(memberStatusClass(blockedMember)).toBe('status-pill status-pill--danger');
  });

  it('builds row views with precomputed status fields', () => {
    const rows = buildOrganizationMemberRowViews([activeMember, blockedMember]);

    expect(rows).toHaveLength(2);
    expect(rows[0].member).toBe(activeMember);
    expect(rows[0].statusLabel).toBe('Active');
    expect(rows[0].statusClass).toBe('status-pill status-pill--success');
    expect(rows[1].member).toBe(blockedMember);
    expect(rows[1].statusLabel).toBe('Blocked');
    expect(rows[1].statusClass).toBe('status-pill status-pill--danger');
  });
});

describe('OrganizationPageComponent', () => {
  let fixture: ComponentFixture<OrganizationPageComponent>;
  let component: OrganizationPageComponent;
  let members: ReturnType<typeof signal<OrganizationMember[]>>;

  const sampleMember: OrganizationMember = {
    id: 'user-1',
    email: 'member@example.com',
    isOwner: false,
    isBlocked: false,
    emailVerifiedAt: '2026-06-01T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    members = signal<OrganizationMember[]>([]);

    await TestBed.configureTestingModule({
      imports: [OrganizationPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => false,
            user: () => ({ isOwner: true }),
            organization: () => ({ configuration: {} }),
          },
        },
        {
          provide: OrganizationMembersStore,
          useValue: {
            members: () => members(),
            isLoading: () => false,
            error: () => null,
            loadMembers: vi.fn(),
            updateMemberStatus: vi.fn(),
          },
        },
        {
          provide: OrganizationMembersApiService,
          useValue: { inviteMember: vi.fn() },
        },
        {
          provide: OrganizationUsageStore,
          useValue: {
            usage: () => null,
            isLoading: () => false,
            error: () => null,
            loadUsage: vi.fn(),
          },
        },
        {
          provide: SetupChecklistService,
          useValue: { markInviteSent: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        DashboardModeService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationPageComponent);
    component = fixture.componentInstance;
  });

  it('exposes memberRowViews with precomputed status fields', () => {
    members.set([
      sampleMember,
      { ...sampleMember, id: 'user-2', email: 'blocked@example.com', isBlocked: true },
    ]);
    fixture.detectChanges();

    const rows = component.memberRowViews();

    expect(rows).toHaveLength(2);
    expect(rows[0].statusLabel).toBe('Active');
    expect(rows[0].statusClass).toBe('status-pill status-pill--success');
    expect(rows[1].statusLabel).toBe('Blocked');
    expect(rows[1].statusClass).toBe('status-pill status-pill--danger');
  });

  it('trackRow returns stable member id', () => {
    members.set([sampleMember]);
    fixture.detectChanges();

    const [row] = component.memberRowViews();

    expect(component.trackRow(0, row)).toBe(sampleMember.id);
  });

  it('renders member status from row view models', () => {
    members.set([
      sampleMember,
      { ...sampleMember, id: 'user-2', email: 'blocked@example.com', isBlocked: true },
    ]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('member@example.com');
    expect(root.textContent).toContain('blocked@example.com');
    expect(root.textContent).toContain('Active');
    expect(root.textContent).toContain('Blocked');
  });
});
