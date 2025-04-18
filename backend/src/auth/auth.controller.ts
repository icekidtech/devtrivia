import { Body, Controller, Post, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('signup')
  async signup(@Body() body: { email: string; name: string; password: string; role: 'ADMIN' | 'MODERATOR' | 'USER' }) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword, // Ensure this field exists in the Prisma schema
          role: body.role,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException('User with this username already exists');
        }
      }
      throw error;
    }
  }
}