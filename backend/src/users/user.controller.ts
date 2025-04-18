import { Body, Controller, Post, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createUser(@Body() body: { email: string; name?: string }) {
    try {
      return await this.prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
        },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('User with this email already exists');
      }
      throw error; // Re-throw other errors
    }
  }
}