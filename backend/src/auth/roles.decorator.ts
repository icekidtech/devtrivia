import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles as RolesDecorator } from './roles.decorator';
import { RoleGuard } from './role.guard';

@Controller('admin')
@UseGuards(RoleGuard)
export class AdminController {
  @Get()
  @RolesDecorator('ADMIN')
  getAdminDashboard() {
    return 'Admin Dashboard';
  }
}