import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import your AuthGuard and RolesGuard if you use them

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  // @UseGuards(AuthGuard, RolesGuard) // Uncomment if you use guards
  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}