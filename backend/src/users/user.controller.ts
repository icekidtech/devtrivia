import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  UseInterceptors, 
  UploadedFile, 
  Request, 
  UseGuards, 
  ConflictException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  // Get user profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    });
    return user;
  }

  // Update user profile
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() body: { name?: string; email?: string; currentPassword?: string; newPassword?: string; },
  ) {
    const userData: any = {};
    
    if (body.name) userData.name = body.name;
    if (body.email) userData.email = body.email;
    
    // If updating password
    if (body.currentPassword && body.newPassword) {
      // Verify current password
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
      });
      
      const isPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      userData.password = await bcrypt.hash(body.newPassword, 10);
    }
    
    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: req.user.id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });
    
    return updatedUser;
  }
  
  // Upload profile image
  @UseGuards(JwtAuthGuard)
  @Post('profile/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${req.user.id}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(@Request() req, @UploadedFile() file) {
    // Update user with image path
    const updatedUser = await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: `/uploads/profiles/${file.filename}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });
    
    return updatedUser;
  }
}