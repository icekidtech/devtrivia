import { Body, Controller, Post, Patch, ConflictException, UnauthorizedException, UseGuards, Get, Param, Delete, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './roles.decorator';
import { RoleGuard } from './role.guard'; // Adjust the path if necessary

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService, // Inject JwtService
  ) {}

  @Post('signup')
  async signup(@Body() body: { email: string; name: string; password: string; role: 'ADMIN' | 'MODERATOR' | 'USER' }) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashedPassword,
          role: body.role,
        },
      });

      // Generate a JWT token for the user
      const token = this.jwtService.sign({ id: user.id, role: user.role });
      return { user, token };
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

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    // Check if user exists
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(body.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({ 
      id: user.id, 
      role: user.role 
    });
    
    // Return user info and token
    return { 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  @Patch('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    return this.prisma.user.update({
      where: { email: body.email },
      data: { password: hashedPassword },
    });
  }
}

@Controller('admin')
@UseGuards(RoleGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  @Roles('ADMIN')
  getDashboard() {
    return 'Admin Dashboard';
  }

  @Get('users')
  @Roles('ADMIN')
  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  @Patch('users/:id')
  @Roles('ADMIN')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  @Delete('users/:id')
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // Repeat similar for quizzes, questions, answers
}

@Controller('user')
@UseGuards(RoleGuard)
export class UserController {
  @Get('dashboard')
  @Roles('USER')
  getDashboard() {
    return 'User Dashboard';
  }
}