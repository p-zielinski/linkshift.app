import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { OrganizationMembersService } from './organization-members.service';
import { DataType } from '../cache/cache-manager.service';

describe('OrganizationMembersService - registerFromInvite', () => {
  let service: OrganizationMembersService;
  let linkMapCreate: jest.Mock;
  let redirectRuleCreate: jest.Mock;
  let userCreate: jest.Mock;

  beforeEach(() => {
    linkMapCreate = jest.fn();
    redirectRuleCreate = jest.fn();
    userCreate = jest.fn().mockResolvedValue({
      id: 'usr_invited',
      email: 'invited@example.com',
      organizationId: 'org_existing',
    });

    const prisma = {
      organizationInvite: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'inv_test',
          email: 'invited@example.com',
          organizationId: 'org_existing',
        }),
      },
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          user: { create: userCreate },
          organizationInvite: {
            update: jest.fn().mockResolvedValue({}),
          },
          linkMap: { create: linkMapCreate },
          redirectRule: { create: redirectRuleCreate },
        }),
      ),
    };

    service = new OrganizationMembersService(
      prisma as any,
      { getId: jest.fn().mockReturnValue('req_test') } as unknown as ClsService,
      {} as any,
      {
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      } as any,
      {
        createToken: jest.fn().mockResolvedValue('verification-token'),
      } as any,
      {
        setDataExist: jest.fn().mockResolvedValue(undefined),
      } as any,
      {
        buildConsentRecord: jest.fn().mockReturnValue({
          termsAcceptedAt: new Date(),
          privacyAcceptedAt: new Date(),
          ageConfirmedAt: new Date(),
        }),
      } as any,
      {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        setContext: jest.fn(),
      } as unknown as Logger,
    );
  });

  it('does not provision starter link map or redirect rule for invited users', async () => {
    const result = await service.registerFromInvite({
      token: 'invite-token',
      email: 'invited@example.com',
      password: 'password123',
      acceptTerms: true,
      acceptPrivacy: true,
      confirmAge: true,
    });

    expect(result).toEqual({ success: true });
    expect(userCreate).toHaveBeenCalled();
    expect(linkMapCreate).not.toHaveBeenCalled();
    expect(redirectRuleCreate).not.toHaveBeenCalled();
  });
});
