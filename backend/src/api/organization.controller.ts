import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { OrganizationService } from '../organization/organization.service';
import { OrganizationMembersService } from '../organization/organization-members.service';
import { ZodPipe } from '../pipes/zod.pipe';
import {
  OrganizationInviteSchema,
  OrganizationMemberStatusSchema,
  type OrganizationInviteDto,
  type OrganizationMemberStatusDto,
} from '../zod-schames/organization.schemas';

@Controller('api/v1/organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly membersService: OrganizationMembersService,
  ) {}

  @Get('usage')
  @UseGuards(AuthGuard)
  async getUsage(@User('organizationId') organizationId: string) {
    return this.organizationService.getUsageSummary(organizationId);
  }

  @Get('members')
  @UseGuards(AuthGuard)
  async listMembers(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
  ) {
    return this.membersService.listMembers({
      organizationId,
      requesterId: userId,
    });
  }

  @Post('invites')
  @UseGuards(AuthGuard)
  async createInvite(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
    @Body(new ZodPipe(OrganizationInviteSchema))
    body: OrganizationInviteDto,
  ) {
    return this.membersService.createInvite({
      organizationId,
      inviterId: userId,
      email: body.email,
    });
  }

  @Patch('members/:id/status')
  @UseGuards(AuthGuard)
  async updateMemberStatus(
    @User('organizationId') organizationId: string,
    @User('userId') userId: string,
    @Param('id') memberId: string,
    @Body(new ZodPipe(OrganizationMemberStatusSchema))
    body: OrganizationMemberStatusDto,
  ) {
    return this.membersService.updateMemberStatus({
      organizationId,
      requesterId: userId,
      userId: memberId,
      blocked: body.blocked,
    });
  }
}
