import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createUser(@Body() body: { email: string; name?: string }) {
    return this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      },
    });
  }
}