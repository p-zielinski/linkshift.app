import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { OrganizationService } from '../organization/organization.service';

@Controller('api/v1/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('usage')
  @UseGuards(AuthGuard)
  async getUsage(@User('organizationId') organizationId: string) {
    return this.organizationService.getUsageSummary(organizationId);
  }
}
