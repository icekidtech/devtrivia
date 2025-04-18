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
          password: 'defaultPassword123', // Replace with a secure password or hash
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('User with this email already exists');
        }
        if (error.meta?.target?.includes('name')) {
          const suggestions = this.generateUsernameSuggestions(body.name ?? 'user');
          throw new ConflictException({
            message: 'Username is already taken',
            suggestions,
          });
        }
      }
      throw error; // Re-throw other errors
    }
  }

  private generateUsernameSuggestions(baseName: string): string[] {
    const randomNumbers = Array.from({ length: 3 }, () =>
      Math.floor(1000 + Math.random() * 9000),
    );
    return randomNumbers.map((num) => `${baseName}${num}`);
  }
}